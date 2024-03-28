import { Stream } from '@yeger/streams'
import { z } from 'zod'

export type ParameterType = 'number' | 'string' | 'boolean'

export type Parameter = Readonly<
  { readonly type: ParameterType, readonly description: string } & (
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

export function deriveValidator<Parameters extends ParameterMetadata>(
  parameterMetadata: Parameters,
) {
  const parameterSchemas = Stream.fromObject(parameterMetadata)
    .map(([name, metadata]) => ({
      name,
      schema: getZodValidator(metadata),
    }))
    .toRecord(
      ({ name }) => name,
      ({ schema }) => schema,
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
