import { Stream } from '@yeger/streams'
import { z } from 'zod'

export type ParameterType = 'number' | 'string' | 'boolean'

export interface Parameter<Type extends ParameterType> {
  type: Type
  description: string
  defaultValue?: ResolveParameterType<Type>
}

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

export type ParameterMetadata = Record<string, Parameter<ParameterType>>

export type ResolveParameters<Ps extends ParameterMetadata> = {
  [P in keyof Ps]: ResolveParameterType<Ps[P]['type']>
}

export type ResolveZodSchema<Ps extends ParameterMetadata> = {
  [P in keyof Ps]: ResolveZodType<Ps[P]>
}

export type ResolveZodType<P extends Parameter<ParameterType>> =
  P['type'] extends 'number'
    ? z.ZodNumber
    : P['type'] extends 'string'
    ? z.ZodString
    : P['type'] extends 'boolean'
    ? z.ZodBoolean
    : never

export type ResolveParameterType<Type extends ParameterType> =
  Type extends 'number'
    ? number
    : Type extends 'string'
    ? string
    : Type extends 'boolean'
    ? boolean
    : never

// From: https://stackoverflow.com/a/57683652
export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T

function deriveValidator<Parameters extends ParameterMetadata>(
  parameterMetadata: Parameters
) {
  return z.object(
    Object.fromEntries(
      Stream.fromObject(parameterMetadata)
        .map(
          ([name, metadata]) => [name, getZodValidator(metadata.type)] as const
        )
        .toArray()
    )
  ) as z.ZodObject<ExpandRecursively<ResolveZodSchema<Parameters>>>
}

export type ValidationResult<Parameters extends ParameterMetadata> =
  z.SafeParseReturnType<
    unknown,
    ExpandRecursively<ResolveParameters<Parameters>>
  >

export interface Plugin<Out, Parameters extends ParameterMetadata> {
  readonly name: string
  readonly parameters: Parameters
  invoke(
    input: string,
    parameters: ExpandRecursively<ResolveParameters<Parameters>>
  ): Out
  validate(parameters: unknown): ValidationResult<Parameters>
}

export function definePlugin<Out, Parameters extends ParameterMetadata>(
  plugin: Omit<Plugin<Out, Parameters>, 'validate'>
) {
  const validator = deriveValidator(plugin.parameters)
  function validate(parameters: unknown): ValidationResult<Parameters> {
    // @ts-expect-error Types are good enough
    return validator.safeParse(parameters)
  }
  return { ...plugin, validate }
}
