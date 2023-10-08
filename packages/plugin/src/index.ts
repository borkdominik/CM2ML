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
        readonly allowedValues?: readonly string[]
      }
    | {
        readonly type: 'boolean'
        readonly defaultValue: boolean
      }
  )
>

function getZodValidator(parameter: Parameter) {
  switch (parameter.type) {
    case 'number':
      return z.number()
    case 'string':
      if (parameter.allowedValues && parameter.allowedValues.length > 0) {
        return z.enum(parameter.allowedValues as [string, ...string[]])
      }
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
      schema: getZodValidator(metadata),
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

export interface Plugin<In, Out, Parameters extends ParameterMetadata>
  extends PluginMetadata<Parameters> {
  readonly validate: (
    parameters: unknown
  ) => Readonly<ResolveParameters<Parameters>>
  readonly validateAndInvoke: (input: In, parameters: unknown) => Out
}

export class BasePlugin<In, Out, Parameters extends ParameterMetadata>
  implements Plugin<In, Out, Parameters>
{
  private readonly validator: ReturnType<typeof deriveValidator>

  public constructor(
    public readonly name: string,
    public readonly parameters: Parameters,
    public readonly invoke: PluginInvoke<In, Out, Parameters>
  ) {
    this.validator = deriveValidator(parameters)
  }

  /** Validate the passed parameters and invoke the plugin if successful */
  public validateAndInvoke(input: In, parameters: unknown): Out {
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

export function definePlugin<In, Out, Parameters extends ParameterMetadata>(
  data: PluginMetadata<Parameters> & {
    invoke: PluginInvoke<In, Out, Parameters>
  }
) {
  return new BasePlugin<In, Out, Parameters>(
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

export abstract class PluginAdapter<In> {
  protected plugins = new Map<string, Plugin<In, unknown, any>>()

  private started = false

  public applyAll(plugins: Plugin<In, unknown, ParameterMetadata>[]) {
    Stream.from(plugins).forEach((plugin) => this.apply(plugin))
    return this
  }

  public apply(
    plugin: Plugin<In, unknown, ParameterMetadata>
  ): PluginAdapter<In> {
    this.requireNotStarted()
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already applied.`)
    }
    this.plugins.set(plugin.name, plugin)
    this.onApply(plugin)
    return this
  }

  protected abstract onApply<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<In, Out, Parameters>
  ): void

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

export function compose<
  In,
  I1,
  P1 extends ParameterMetadata,
  Out,
  P2 extends ParameterMetadata
>(
  ...plugins: [BasePlugin<In, I1, P1>, BasePlugin<I1, Out, P2>]
): Plugin<In, Out, P1 & P2>
export function compose<
  In,
  I1,
  P1 extends ParameterMetadata,
  I2,
  P2 extends ParameterMetadata,
  Out,
  P3 extends ParameterMetadata
>(
  ...plugins: [
    BasePlugin<In, I1, P1>,
    BasePlugin<I1, I2, P2>,
    BasePlugin<I2, Out, P3>
  ]
): Plugin<In, Out, P1 & P2>
export function compose<In, Out, P extends ParameterMetadata>(
  ...plugins: BasePlugin<In, Out, P>[]
): BasePlugin<In, Out, P> {
  return definePlugin({
    name: plugins[plugins.length - 1]!.name,
    parameters: joinParameters(plugins),
    invoke: createInvocationChain<In, Out>(plugins),
  }) as unknown as any
}

function joinParameters(plugins: PluginMetadata<ParameterMetadata>[]) {
  return Stream.from(plugins)
    .map((plugin) => plugin.parameters)
    .reduce((a, b) => ({ ...a, ...b }), {})
}

function createInvocationChain<In, Out>(plugins: BasePlugin<any, any, any>[]) {
  if (plugins.length === 0) {
    throw new Error('Cannot create invocation chain without plugins.')
  }
  return (
    input: unknown,
    parameters: Record<string, number | string | boolean>
  ) =>
    Stream.from(plugins).reduce(
      (intermediateResult, plugin) =>
        plugin.invoke(intermediateResult, parameters),
      input
    ) as (
      input: In,
      parameters: Record<string, number | string | boolean>
    ) => Out
}
