import { getMessage } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'

import { catching, trying } from './error'
import type { Parameter, ParameterMetadata, ResolveParameters } from './parameters'
import type { Plugin, PluginInvoke, PluginMetadata } from './plugin'
import { definePlugin } from './plugin'

/**
 * Composes two plugins into a new plugin.
 * The new plugin invokes the first plugin with the input, then invokes the second plugin with the result of the first plugin.
 * The parameters of the new plugin are the union of the parameters of the two plugins.
 */
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
    return definePlugin({
      name,
      parameters: joinParameters([first, second]) as P1 & P2,
      invoke: createInvocationChain(first, second),
      batchMetadataCollector: first.batchMetadataCollector,
    })
  } catch (error) {
    console.error(getMessage(error))
    throw error
  }
}

/**
 * Wraps a plugin to catch errors and return a {@link ExecutionError} instead.
 */
export function tryCatch<In, Out, Parameters extends ParameterMetadata, BMIn, BMOut>(plugin: Plugin<In, Out, Parameters, BMIn, BMOut>) {
  return compose(trying(plugin), catching())
}

/**
 * Wraps a plugin to accept an array of inputs and return an array of outputs.
 */
export function batch<In, Out, Parameters extends ParameterMetadata, BMIn, BMOut>(plugin: Plugin<In, Out, Parameters, BMIn, BMOut>, name = `batch-${plugin.name}`): Plugin<In[], Out[], Parameters, BMIn, BMOut> {
  return definePlugin({
    name,
    parameters: plugin.parameters,
    invoke: (input: In[], parameters, batchMetadata) => {
      return input.map((item) => plugin.invoke(item, parameters, batchMetadata))
    },
    batchMetadataCollector: (batch: In[][], previousBatchMetadata) => {
      const flattenedInput = batch.flatMap((item) => item)
      return plugin.batchMetadataCollector?.(flattenedInput, previousBatchMetadata)
    },
  })
}

export function batchTryCatch<In, Out, Parameters extends ParameterMetadata, BMIn, BMOut>(plugin: Plugin<In, Out, Parameters, BMIn, BMOut>, name = `batch-${plugin.name}`) {
  return batch(tryCatch(plugin), name)
}

/**
 * Composes two plugins into a new plugin that accepts an array of inputs and returns an array of outputs.
 */
export function batchedCompose<
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
) {
  return compose(
    batchTryCatch(first),
    batchTryCatch(second),
    name,
  )
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
