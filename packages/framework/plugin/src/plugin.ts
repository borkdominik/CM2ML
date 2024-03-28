import { getMessage } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'
import { ZodError, z } from 'zod'

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

function deriveValidator<Parameters extends ParameterMetadata>(
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

export type PluginMetadata<Parameters extends ParameterMetadata> = Readonly<{
  readonly name: string
  readonly parameters: Parameters
}>

export type BatchMetadataCollector<In, BMIn, BMOut> = (intermediateResults: In[], previousBatchMetadata: BMIn | undefined) => BMOut | undefined

export type PluginInvoke<In, Out, Parameters extends ParameterMetadata, BatchMetadata> = (
  input: In,
  parameters: Readonly<ResolveParameters<Parameters>>,
  batchMetadata: BatchMetadata | undefined,
) => Out

export class Plugin<In, Out, Parameters extends ParameterMetadata, PreviousBatchMetadata = unknown, BatchMetadata = unknown> {
  private readonly validator: ReturnType<typeof deriveValidator>

  public constructor(
    public readonly name: string,
    public readonly parameters: Parameters,
    public readonly invoke: PluginInvoke<In, Out, Parameters, BatchMetadata>,
    public readonly batchMetadataCollector: BatchMetadataCollector<In, PreviousBatchMetadata, BatchMetadata> | undefined,
  ) {
    this.validator = deriveValidator(parameters)
  }

  /** Validate the passed parameters and invoke the plugin if successful */
  public validateAndInvoke(input: In, parameters: unknown): Out {
    const validatedParameters = this.validate(parameters)
    return this.invoke(input, validatedParameters, undefined)
  }

  public validate(
    parameters: unknown,
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

export function definePlugin<In, Out, Parameters extends ParameterMetadata, PreviousBatchMetadata, BatchMetadata>(
  data: PluginMetadata<Parameters> & {
    invoke: PluginInvoke<In, Out, Parameters, BatchMetadata>
    batchMetadataCollector?: BatchMetadataCollector<In, PreviousBatchMetadata, BatchMetadata>
  },
) {
  return new Plugin<In, Out, Parameters, PreviousBatchMetadata, BatchMetadata>(
    data.name,
    data.parameters,
    data.invoke,
    data.batchMetadataCollector,
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

export function compose<
  In,
  I1,
  P1 extends ParameterMetadata,
  BMIn,
  BMMid,
  Out,
  P2 extends ParameterMetadata,
  BMOut,
>(
  first: Plugin<In, I1, P1, BMIn, BMMid>,
  second: Plugin<I1, Out, P2, BMMid, BMOut>,
  name = `${first.name}-${second.name}`,
): Plugin<In, Out, P1 & P2, BMIn, BMMid> {
  try {
    const plugins = [first, second]
    return definePlugin({
      name,
      parameters: joinParameters(plugins) as P1 & P2,
      invoke: createInvocationChain(first, second),
      batchMetadataCollector: first.batchMetadataCollector,
    })
  } catch (error) {
    console.error(getMessage(error))
    throw error
  }
}

function joinParameters(plugins: PluginMetadata<ParameterMetadata>[]) {
  const parameters: Record<string, Parameter> = {}

  Stream.from(plugins)
    .map((plugin) => plugin.parameters)
    .forEach((pluginParameters) => {
      Stream.fromObject(pluginParameters).forEach(([name, parameter]) => {
        const existingParameter = parameters[name]
        if (existingParameter && existingParameter.type !== parameter.type) {
          throw new Error(
            `Parameter ${name} is defined multiple times with different types in the plugin composition.`,
          )
        }
        parameters[name] = parameter
      })
    })

  return parameters
}

export function batch<
  In,
  I1,
  P1 extends ParameterMetadata,
  BMIn,
  BMMid,
  Out,
  P2 extends ParameterMetadata,
  BMOut,
>(
  first: Plugin<In, I1, P1, BMIn, BMMid>,
  second: Plugin<I1, Out, P2, BMMid, BMOut>,
  name = `batch-${first.name}-${second.name}`,
): Plugin<In[], Out[], P1 & P2, BMIn, BMMid> {
  try {
    const plugins = [first, second]
    return definePlugin({
      name,
      parameters: joinParameters(plugins) as P1 & P2,
      invoke: createBatchedInvocationChain<In, I1, P1, BMIn, BMMid, Out, P2, BMOut>(first, second),
      batchMetadataCollector: first.batchMetadataCollector
        ? (input, previousBatchMetadata) => {
            const flattenedInput = input.flatMap((item) => item)
            return first.batchMetadataCollector?.(flattenedInput, previousBatchMetadata)
          }
        : undefined,
    })
  } catch (error) {
    console.error(getMessage(error))
    throw error
  }
}

function createInvocationChain<
  In,
  I1,
  P1 extends ParameterMetadata,
  BMIn,
  BMMid,
  Out,
  P2 extends ParameterMetadata,
  BMOut,
  >(first: Plugin<In, I1, P1, BMIn, BMMid>, second: Plugin<I1, Out, P2, BMMid, BMOut>): PluginInvoke<In, Out, P1 & P2, BMMid> {
  return (
    input: In,
    parameters: Readonly<ResolveParameters<P1 & P2>>,
    batchMetadata: BMMid | undefined,
  ) => {
    const intermediateResult = first.invoke(input, parameters as Readonly<ResolveParameters<P1>>, batchMetadata)
    const nextBatchMetadata = second.batchMetadataCollector?.([intermediateResult], batchMetadata)
    return second.invoke(intermediateResult, parameters as Readonly<ResolveParameters<P2>>, nextBatchMetadata)
  }
}

function createBatchedInvocationChain<
  In,
  I1,
  P1 extends ParameterMetadata,
  BMIn,
  BMMid,
  Out,
  P2 extends ParameterMetadata,
  BMOut,
  >(first: Plugin<In, I1, P1, BMIn, BMMid>, second: Plugin<I1, Out, P2, BMMid, BMOut>): PluginInvoke<In[], Out[], P1 & P2, BMMid> {
  return (
    input: In[],
    parameters: Readonly<ResolveParameters<P1 & P2>>,
    batchMetadata: BMMid | undefined,
  ) => {
    const intermediateResults = input.map((item) =>
      first.invoke(item, parameters as Readonly<ResolveParameters<P1>>, batchMetadata),
    )
    const nextBatchMetadata = second.batchMetadataCollector?.(intermediateResults, batchMetadata)
    return intermediateResults.map((intermediateResult) =>
      second.invoke(intermediateResult, parameters as Readonly<ResolveParameters<P2>>, nextBatchMetadata),
    )
  }
}
