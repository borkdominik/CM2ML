import { ZodError } from 'zod'

import type { ParameterMetadata, ResolveParameters } from './parameters'
import { ValidationError, deriveValidator } from './parameters'

export type PluginMetadata<Parameters extends ParameterMetadata> = Readonly<{
  readonly name: string
  readonly parameters: Parameters
}>

export type BatchMetadataCollector<In, Parameters extends ParameterMetadata, BatchMetadata> = (batch: In[], parameters: Readonly<ResolveParameters<Parameters>>) => BatchMetadata

export type PluginInvoke<In, Out, Parameters extends ParameterMetadata, BatchMetadata> = (
  input: In,
  parameters: Readonly<ResolveParameters<Parameters>>,
  batchMetadata: BatchMetadata,
) => Out

export type InferOut<P> = P extends Plugin<any, infer Out, any, any> ? Out : never

export class Plugin<In, Out, Parameters extends ParameterMetadata, BatchMetadata = undefined> {
  private readonly validator: ReturnType<typeof deriveValidator>

  public constructor(
    public readonly name: string,
    public readonly parameters: Parameters,
    public readonly invoke: PluginInvoke<In, Out, Parameters, BatchMetadata>,
    public readonly batchMetadataCollector: BatchMetadataCollector<In, Parameters, BatchMetadata>,
  ) {
    this.validator = deriveValidator(parameters)
  }

  /** Validate the passed parameters and invoke the plugin if successful */
  public validateAndInvoke(input: In, parameters: unknown): Out {
    const validatedParameters = this.validate(parameters)
    const batchMetadata = this.batchMetadataCollector([input], validatedParameters)
    return this.invoke(input, validatedParameters, batchMetadata)
  }

  public validate(
    parameters: unknown,
  ): Readonly<ResolveParameters<Parameters>> {
    try {
      return this.validator.parse(parameters)
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZodError(error)
      }
      throw error
    }
  }
}

export function definePlugin<In, Out, Parameters extends ParameterMetadata, BatchMetadata>(
  data: PluginMetadata<Parameters> & {
    invoke: PluginInvoke<In, Out, Parameters, BatchMetadata>
    batchMetadataCollector: BatchMetadataCollector<In, Parameters, BatchMetadata>
  },
): Plugin<In, Out, Parameters, BatchMetadata>
export function definePlugin<In, Out, Parameters extends ParameterMetadata>(
  data: PluginMetadata<Parameters> & {
    invoke: PluginInvoke<In, Out, Parameters, undefined>
  }
): Plugin<In, Out, Parameters, undefined>
export function definePlugin<In, Out, Parameters extends ParameterMetadata, BatchMetadata>(
  data: PluginMetadata<Parameters> & {
    invoke: PluginInvoke<In, Out, Parameters, BatchMetadata | undefined>
    batchMetadataCollector?: BatchMetadataCollector<In, Parameters, BatchMetadata>
  },
) {
  if (data.batchMetadataCollector) {
    return new Plugin(
      data.name,
      data.parameters,
      data.invoke,
      data.batchMetadataCollector,
    )
  }
  return new Plugin(
    data.name,
    data.parameters,
    data.invoke,
    () => undefined,
  )
}
