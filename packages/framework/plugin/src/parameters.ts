import { Stream } from '@yeger/streams'
import { z } from 'zod'

export type PrimitiveParameterType = 'number' | 'string' | 'boolean'

export type ListParameterType = `list<string>`

export type ParameterType = PrimitiveParameterType | ListParameterType

export type ParameterBase = Readonly<{
  readonly type: ParameterType
  /**
   * A *short* description of the parameter.
   */
  readonly description: string
  readonly group?: string
  readonly displayName?: string
  /** An optional, longer, and more detailed description of the parameter. */
  readonly helpText?: string
}>

export type PrimitiveParameter = ParameterBase & Readonly<
  {
    readonly type: 'number'
    readonly defaultValue: number
  }
  | {
    readonly type: 'string'
    readonly defaultValue: string
    readonly allowedValues?: readonly string[]
    readonly processFile?: (fileContent: string) => string
  }
  | {
    readonly type: 'boolean'
    readonly defaultValue: boolean
  }
>

export type ListParameter = ParameterBase & Readonly<
  {
    readonly type: 'list<string>'
    readonly defaultValue: readonly string[]
    readonly allowedValues?: readonly string[]
    readonly processFile?: (fileContent: string) => string
  } & {
    /**
     * If true, the list will not contain duplicate values.
     * Duplicate values are allowed, but will be removed.
     */
    readonly unique?: boolean
    /**
     * If true, the order of the items in the list will be preserved.
     * If false, the items will be sorted.
     */
    readonly ordered?: boolean
  } & ({ readonly unique?: boolean, readonly ordered?: false } | { readonly unique: true, readonly ordered: true })
>

export type Parameter = PrimitiveParameter | ListParameter

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
    case 'list<string>': {
      const baseArray = parameter.allowedValues && parameter.allowedValues.length > 0 ? z.array(z.enum(parameter.allowedValues as [string, ...string[]])) : z.array(z.string())
      return baseArray.default([...parameter.defaultValue]).transform((value) => {
        if (!parameter.ordered && !parameter.unique) {
          return value.toSorted()
        }
        if (parameter.ordered && !parameter.unique) {
          throw new Error('Ordered lists must be unique')
        }
        if (parameter.ordered && parameter.unique) {
          const visited = new Set<string>()
          return value.filter((item) => {
            if (visited.has(item)) {
              return false
            }
            visited.add(item)
            return true
          })
        }
        if (!parameter.ordered && parameter.unique) {
          return [...new Set(value)].toSorted()
        }
        throw new Error('Invalid list configuration. This is an internal error.')
      })
    }
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
        : Type extends 'list<string>'
          ? z.ZodDefault<z.ZodArray<z.ZodString>>
          : Type extends 'list<number>' // this does not exist and will never be true, but it somehow fixes ts complaints
            ? z.ZodDefault<z.ZodArray<z.ZodNumber>>
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
    case 'list<string>':
      return getArrayConstructor('string')
  }
}
