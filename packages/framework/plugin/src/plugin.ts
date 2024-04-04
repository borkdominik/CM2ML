import { ZodError } from 'zod'

import type { ParameterMetadata, ResolveParameters } from './parameters'
import { ValidationError, deriveValidator } from './parameters'

export type PluginMetadata<Parameters extends ParameterMetadata> = Readonly<{
  readonly name: string
  readonly parameters: Parameters
}>

export type BatchMetadataCollector<In, BMIn, BMOut> = (batch: In[], previousBatchMetadata: BMIn | undefined) => BMOut | undefined

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