import { Stream } from '@yeger/streams'
import { z } from 'zod'

export type PrimitiveParameterType = 'number' | 'string' | 'boolean'

export type ArrayParameterType = `array<string>` // `array<${PrimitiveParameterType}>`

export type ParameterType = PrimitiveParameterType | ArrayParameterType

export type ParameterBase = Readonly<{ readonly type: ParameterType, readonly description: string }>

export type PrimitiveParameter = ParameterBase & Readonly<
  {
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
>

export type ArrayParameter = ParameterBase & Readonly<
  // {
  //   readonly type: 'array<number>'
  //   readonly defaultValue: readonly number[]
  // } |
  {
    readonly type: 'array<string>'
    readonly defaultValue: readonly string[]
    readonly allowedValues?: readonly string[]
  }
  // |
  // {
  //   readonly type: 'array<boolean>'
  //   readonly defaultValue: readonly boolean[]
  // }
>

export type Parameter = PrimitiveParameter | ArrayParameter

function getZodValidator(parameter: Parameter) {
  switch (parameter.type) {
    case 'number':
      return z.number().default(parameter.defaultValue)
    case 'string':
      if (parameter.allowedValues && parameter.allowedValues.length > 0) {
        return z.enum(parameter.allowedValues as [string, ...string[]]).default(parameter.defaultValue)
      }
      return z.string().default(parameter.defaultValue)
    case 'boolean':
      return z.boolean().default(parameter.defaultValue)
    // case 'array<number>':
    //   return z.array(z.number()).default([...parameter.defaultValue])
    case 'array<string>':
      if (parameter.allowedValues && parameter.allowedValues.length > 0) {
        return z.array(z.enum(parameter.allowedValues as [string, ...string[]])).default([...parameter.defaultValue])
      }
      return z.array(z.string()).default([...parameter.defaultValue])
    // case 'array<boolean>':
    //   return z.array(z.boolean()).default([...parameter.defaultValue])
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
    ? z.ZodDefault<z.ZodNumber>
    : Type extends 'string'
      ? z.ZodDefault<z.ZodString>
      : Type extends 'boolean'
        ? z.ZodDefault<z.ZodBoolean>
        : Type extends 'array<number>'
          ? z.ZodDefault<z.ZodArray<z.ZodNumber>>
          : Type extends 'array<string>'
            ? z.ZodDefault<z.ZodArray<z.ZodString>>
            : Type extends 'array<boolean>'
              ? z.ZodDefault<z.ZodArray<z.ZodBoolean>>
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

function getPrimitiveConstructor(primitiveParameterType: PrimitiveParameterType) {
  switch (primitiveParameterType) {
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

function getArrayConstructor(primitiveParameterType: PrimitiveParameterType) {
  const primitiveConstructor = getPrimitiveConstructor(primitiveParameterType)
  return (input: unknown) => {
    const array = input as unknown[]
    return array.map((value) => primitiveConstructor(value))
  }
}

export function getTypeConstructor(parameterType: ParameterType) {
  switch (parameterType) {
    case 'number':
    case 'string':
    case 'boolean':
      return getPrimitiveConstructor(parameterType)
    // case 'array<number>':
    //   return getArrayConstructor('number')
    case 'array<string>':
      return getArrayConstructor('string')
    // case 'array<boolean>':
    //   return getArrayConstructor('boolean')
  }
}
