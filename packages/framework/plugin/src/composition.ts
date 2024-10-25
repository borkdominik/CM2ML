import { getMessage } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'

import { ExecutionError, catching, trying } from './error'
import type { Parameter, ParameterMetadata, ResolveParameters } from './parameters'
import type { Plugin, PluginInvoke, PluginMetadata, StructuredOutput } from './plugin'
import { definePlugin, getFirstNonError } from './plugin'

/**
 * Composes two plugins into a new plugin.
 * The new plugin invokes the first plugin with the input, then invokes the second plugin with the result of the first plugin.
 * The parameters of the new plugin are the union of the parameters of the two plugins.
 */
export function compose<
  In,
  I1,
  P1 extends ParameterMetadata,
  Out,
  P2 extends ParameterMetadata,
>(
  first: Plugin<In, I1, P1>,
  second: Plugin<I1, Out, P2>,
  name = `${first.name}-${second.name}`,
): Plugin<In, Out, P1 & P2> {
  try {
    return definePlugin({
      name,
      parameters: joinParameters([first, second]) as P1 & P2,
      invoke: createInvocationChain(first, second),
    })
  } catch (error) {
    console.error(getMessage(error))
    throw error
  }
}

/**
 * Wraps a plugin to catch errors and return a {@link ExecutionError} instead.
 */
function tryCatch<In, Out, Parameters extends ParameterMetadata>(plugin: Plugin<In, Out, Parameters>) {
  return compose(trying(plugin), catching())
}

/**
 * Wraps a plugin to accept an array of inputs and return an array of outputs.
 */
export function batch<In, Out, Parameters extends ParameterMetadata>(plugin: Plugin<In, Out, Parameters>, name = `batch-${plugin.name}`): Plugin<In[], Out[], Parameters> {
  return definePlugin({
    name,
    parameters: plugin.parameters,
    invoke: (input: In[], parameters) => {
      return input.map((item) => plugin.invoke(item, parameters))
    },
  })
}

export function batchTryCatch<In, Out, Parameters extends ParameterMetadata>(plugin: Plugin<In, Out, Parameters>, name = `batch-${plugin.name}`) {
  return batch(tryCatch(plugin), name)
}

export function transform<In, Out>(transformer: (input: In) => Out, name = 'transform'): Plugin<In, Out, Record<string, never>> {
  return definePlugin({
    name,
    parameters: {},
    invoke: (input) => transformer(input),
  })
}

export function liftMetadata<Data, Metadata>(name = 'lift-metadata') {
  return transform<(StructuredOutput<Data, Metadata> | ExecutionError)[], StructuredOutput<(Data | ExecutionError)[], Metadata | undefined>>((input) => {
    const metadata = getFirstNonError(input)?.metadata
    return {
      data: input.map((item) => {
        if (item instanceof ExecutionError) {
          return item
        }
        if (item.metadata !== metadata) {
          throw new Error('Metadata mismatch within batch. All entries must share the same metadata object for memory optimization. This is an internal error.')
        }
        return item.data
      }),
      metadata,
    }
  }, name)
}

function joinParameters(plugins: PluginMetadata<ParameterMetadata>[]) {
  const parameters: Record<string, Parameter> = {}

  Stream.from(plugins)
    .map((plugin) => plugin.parameters)
    .forEach((pluginParameters) => {
      Stream.fromObject(pluginParameters).forEach(([name, parameter]) => {
        const existingParameter = parameters[name]
        if (existingParameter !== undefined && existingParameter !== parameter) {
          throw new Error(
            `Parameter ${name} is defined multiple times. Parameters must have unique names.`,
          )
        }
        parameters[name] = parameter
      })
    })

  return parameters
}

function createInvocationChain<
  In,
  I1,
  P1 extends ParameterMetadata,
  Out,
  P2 extends ParameterMetadata,
>(first: Plugin<In, I1, P1>, second: Plugin<I1, Out, P2>): PluginInvoke<In, Out, P1 & P2> {
  return (
    input: In,
    parameters: Readonly<ResolveParameters<P1>> & Readonly<ResolveParameters<P2>>,
  ) => {
    const intermediateResult = first.invoke(input, parameters)
    const output = second.invoke(intermediateResult, parameters)
    return output
  }
}
