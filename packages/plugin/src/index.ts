import { Stream } from '@yeger/streams'
import { z } from 'zod'

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
    : z.ZodAny

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
  return z.object(parameterSchemas)
}

export type ValidationResult<Parameters extends ParameterMetadata> = Readonly<
  z.SafeParseReturnType<unknown, ResolveParameters<Parameters>>
>

export interface PluginData<Out, Parameters extends ParameterMetadata> {
  readonly name: string
  readonly parameters: Parameters
  invoke(
    input: string,
    parameters: Readonly<ResolveParameters<Parameters>>
  ): Out
}
export interface Plugin<Out, Parameters extends ParameterMetadata>
  extends PluginData<Out, Parameters> {
  validate(parameters: unknown): ValidationResult<Parameters>
}

export function definePlugin<Out, Parameters extends ParameterMetadata>(
  plugin: PluginData<Out, Parameters>
): Plugin<Out, Parameters> {
  const validator = deriveValidator(plugin.parameters)
  function validate(parameters: unknown): ValidationResult<Parameters> {
    // @ts-expect-error TS can't handle the expansion of the validation result, even though the types would match
    return validator.safeParse(parameters)
  }
  return { ...plugin, validate }
}

export function getTypeConstructor(parameterType: ParameterType) {
  switch (parameterType) {
    case 'number':
      return Number
    case 'string':
      return String
    case 'boolean':
      return Boolean
  }
}

export abstract class PluginSink {
  protected plugins = new Map<string, Plugin<unknown, ParameterMetadata>>()

  private started = false

  public applyAll<Out, Parameters extends ParameterMetadata>(
    plugins: Plugin<Out, Parameters>[]
  ) {
    Stream.from(plugins).forEach((plugin) => this.apply(plugin))
    return this
  }

  public apply<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<Out, Parameters>
  ): PluginSink {
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
  ): PluginSink

  public start() {
    this.started = true
    this.onStart()
  }

  protected abstract onStart(): void

  private requireNotStarted() {
    if (this.started) {
      throw new Error('PluginSink has already been started.')
    }
  }
}
