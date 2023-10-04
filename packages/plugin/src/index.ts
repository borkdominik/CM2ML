/* eslint-disable @typescript-eslint/brace-style, brace-style */
import { Stream } from '@yeger/streams'
import { ZodError, z } from 'zod'

export type ParameterType = 'number' | 'string' | 'boolean'

export type Parameter = Readonly<
  { readonly type: ParameterType; readonly description: string } & (
    | {
        readonly type: 'number'
        readonly defaultValue: number
      }
    | {
        readonly type: 'string'
        readonly defaultValue: string
      }
    | {
        readonly type: 'boolean'
        readonly defaultValue: boolean
      }
  )
>

function getZodValidator(type: ParameterType) {
  switch (type) {
    case 'number':
      return z.number()
    case 'string':
      return z.string()
    case 'boolean':
      return z.boolean()
  }
}

export type ParameterMetadata = Readonly<Record<string, Parameter>>

export type ResolveParameters<Parameters extends ParameterMetadata> = Expand<
  z.infer<z.ZodObject<ResolveZodSchema<Parameters>>>
>

export type ResolveZodSchema<Parameters extends ParameterMetadata> = {
  readonly [Parameter in keyof Parameters]: ResolveZodParameterType<
    Parameters[Parameter]['type']
  >
}

export type ResolveZodParameterType<Type extends ParameterType> =
  Type extends 'number'
    ? z.ZodNumber
    : Type extends 'string'
    ? z.ZodString
    : Type extends 'boolean'
    ? z.ZodBoolean
    : never

// From: https://stackoverflow.com/a/57683652
export type Expand<T> = T extends object
  ? T extends infer O
    ? { readonly [K in keyof O]: Expand<O[K]> }
    : never
  : T

function deriveValidator<Parameters extends ParameterMetadata>(
  parameterMetadata: Parameters
) {
  const parameterSchemas = Stream.fromObject(parameterMetadata)
    .map(([name, metadata]) => ({
      name,
      schema: getZodValidator(metadata.type),
    }))
    .toRecord(
      ({ name }) => name,
      ({ schema }) => schema
    ) as ResolveZodSchema<Parameters>
  return z.object(parameterSchemas).readonly()
}

export class ValidationError extends Error {
  private constructor(message: string) {
    super(message)
  }

  public static fromZodError(error: z.ZodError): ValidationError {
    const issueMessages = Stream.from(error.issues)
      .map((issue) => {
        return `  - ${issue.path.join('.')}: ${issue.message} (${issue.code})`
      })
      .join('\n')
    const message = `Parameter validation failed:${issueMessages}`
    return new ValidationError(message)
  }
}

export type ValidationResult<Parameters extends ParameterMetadata> = Readonly<
  z.SafeParseReturnType<unknown, ResolveParameters<Parameters>>
>

export type PluginMetadata<Parameters extends ParameterMetadata> = Readonly<{
  readonly name: string
  readonly parameters: Parameters
}>

export type PluginInvoke<In, Out, Parameters extends ParameterMetadata> = (
  input: In,
  parameters: Readonly<ResolveParameters<Parameters>>
) => Out

export interface Plugin<Out, Parameters extends ParameterMetadata>
  extends PluginMetadata<Parameters> {
  readonly validate: (
    parameters: unknown
  ) => Readonly<ResolveParameters<Parameters>>
  readonly validateAndInvoke: (input: string, parameters: unknown) => Out
}

export class BasePlugin<Out, Parameters extends ParameterMetadata>
  implements Plugin<Out, Parameters>
{
  private readonly validator: ReturnType<typeof deriveValidator>

  public constructor(
    public readonly name: string,
    public readonly parameters: Parameters,
    public readonly invoke: PluginInvoke<string, Out, Parameters>
  ) {
    this.validator = deriveValidator(parameters)
  }

  /** Validate the passed parameters and invoke the plugin if successful */
  public validateAndInvoke(input: string, parameters: unknown): Out {
    const validatedParameters = this.validate(parameters)
    return this.invoke(input, validatedParameters)
  }

  public validate(
    parameters: unknown
  ): Readonly<ResolveParameters<Parameters>> {
    try {
      // @ts-expect-error TS can't handle the expansion of the validation result, even though the types would match
      return this.validator.parse(parameters)
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZodError(error)
      }
      throw error
    }
  }
}

export function definePlugin<Out, Parameters extends ParameterMetadata>(
  data: PluginMetadata<Parameters> & {
    invoke: PluginInvoke<string, Out, Parameters>
  }
) {
  return new BasePlugin<Out, Parameters>(
    data.name,
    data.parameters,
    data.invoke
  )
}

export function getTypeConstructor(parameterType: ParameterType) {
  switch (parameterType) {
    case 'number':
      return Number
    case 'string':
      return String
    case 'boolean':
      return (input: unknown) => {
        if (input === 'true') {
          return true
        }
        if (input === 'false') {
          return false
        }
        return Boolean(input)
      }
  }
}

export abstract class PluginAdapter {
  protected plugins = new Map<string, Plugin<unknown, any>>()

  private started = false

  public applyAll(plugins: Plugin<unknown, ParameterMetadata>[]) {
    Stream.from(plugins).forEach((plugin) => this.apply(plugin))
    return this
  }

  public apply(plugin: Plugin<unknown, ParameterMetadata>): PluginAdapter {
    this.requireNotStarted()
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already applied.`)
    }
    this.plugins.set(plugin.name, plugin)
    this.onApply(plugin)
    return this
  }

  protected abstract onApply<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<Out, Parameters>
  ): PluginAdapter

  public start() {
    this.started = true
    this.onStart()
  }

  protected abstract onStart(): void

  private requireNotStarted() {
    if (this.started) {
      throw new Error('PluginAdapter has already been started.')
    }
  }
}
