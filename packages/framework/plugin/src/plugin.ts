import { ZodError } from 'zod'

import type { ExecutionError } from './error'
import type { ParameterMetadata, ResolveParameters } from './parameters'
import { ValidationError, deriveValidator } from './parameters'

export type PluginMetadata<Parameters extends ParameterMetadata> = Readonly<{
  readonly name: string
  readonly parameters: Parameters
}>

export type PluginInvoke<In, Out, Parameters extends ParameterMetadata> = (
  input: In,
  parameters: Readonly<ResolveParameters<Parameters>>,
) => Out

export type InferIn<P> = P extends Plugin<infer In, any, any> ? In : never

export type InferOut<P> = P extends Plugin<any, infer Out, any> ? Out : never

export type InferParameters<P> = P extends Plugin<any, any, infer Parameters> ? Parameters : never

export class Plugin<In, Out, Parameters extends ParameterMetadata> {
  private readonly validator: ReturnType<typeof deriveValidator>

  public constructor(
    public readonly name: string,
    public readonly parameters: Parameters,
    public readonly invoke: PluginInvoke<In, Out, Parameters>,
  ) {
    this.validator = deriveValidator(parameters)
  }

  /** Validate the passed parameters and invoke the plugin if successful */
  public validateAndInvoke(input: In, parameters: unknown): Out {
    const validatedParameters = this.validate(parameters)
    return this.invoke(input, validatedParameters)
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

export function definePlugin<In, Out, Parameters extends ParameterMetadata>(
  data: PluginMetadata<Parameters> & {
    invoke: PluginInvoke<In, Out, Parameters>
  },
) {
  return new Plugin(
    data.name,
    data.parameters,
    data.invoke,
  )
}

export interface StructuredOutput<Data, Metadata> {
  data: Data
  metadata: Metadata
}

export function defineStructuredPlugin<In, Data, Metadata, Parameters extends ParameterMetadata>(
  data: PluginMetadata<Parameters> & {
    invoke: PluginInvoke<In, StructuredOutput<Data, Metadata>, Parameters>
  },
) {
  return definePlugin(data)
}

export function defineStructuredBatchPlugin<In, Data, Metadata, Parameters extends ParameterMetadata>(
  data: PluginMetadata<Parameters> & {
    invoke: PluginInvoke<In, (StructuredOutput<Data, Metadata> | ExecutionError)[], Parameters>
  },
) {
  return definePlugin(data)
}
