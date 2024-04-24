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
  BM1,
  Out,
  P2 extends ParameterMetadata,
  BM2,
>(
  first: Plugin<In, I1, P1, BM1>,
  second: Plugin<I1, Out, P2, BM2>,
  name = `${first.name}-${second.name}`,
): Plugin<In, Out, P1 & P2, BM1> {
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
export function tryCatch<In, Out, Parameters extends ParameterMetadata, BatchMetadata>(plugin: Plugin<In, Out, Parameters, BatchMetadata>) {
  return compose(trying(plugin), catching())
}

/**
 * Wraps a plugin to accept an array of inputs and return an array of outputs.
 */
export function batch<In, Out, Parameters extends ParameterMetadata, BatchMetadata>(plugin: Plugin<In, Out, Parameters, BatchMetadata>, name = `batch-${plugin.name}`): Plugin<In[], Out[], Parameters, BatchMetadata> {
  return definePlugin({
    name,
    parameters: plugin.parameters,
    invoke: (input: In[], parameters, batchMetadata) => {
      return input.map((item) => plugin.invoke(item, parameters, batchMetadata))
    },
    batchMetadataCollector: (batch: In[][]) => {
      const flattenedInput = batch.flatMap((item) => item)
      return plugin.batchMetadataCollector?.(flattenedInput)
    },
  })
}

export function batchTryCatch<In, Out, Parameters extends ParameterMetadata, BatchMetadata>(plugin: Plugin<In, Out, Parameters, BatchMetadata>, name = `batch-${plugin.name}`) {
  return batch(tryCatch(plugin), name)
}

/**
 * Composes two plugins into a new plugin that accepts an array of inputs and returns an array of outputs.
 */
export function batchedCompose<
  In,
  I1,
  P1 extends ParameterMetadata,
  BM1,
  Out,
  P2 extends ParameterMetadata,
  BM2,
>(
  first: Plugin<In, I1, P1, BM1>,
  second: Plugin<I1, Out, P2, BM2>,
  name = `batch-${first.name}-${second.name}`,
) {
  return compose(
    batchTryCatch(first),
    batchTryCatch(second),
    name,
  )
}

export function transform<In, Out>(transformer: (input: In) => Out, name = 'transform'): Plugin<In, Out, Record<string, never>, undefined> {
  return definePlugin({
    name,
    parameters: {},
    invoke: (input) => transformer(input),
  })
}

export const METADATA_KEY = '__metadata__'

export function liftMetadata<In, Metadata>(name = 'lift-metadata') {
  return transform<In[] | (In & { [METADATA_KEY]: Metadata })[], { data: In[], [METADATA_KEY]: Metadata | undefined }>((input) => {
    if (input.length === 0) {
      return { data: [], [METADATA_KEY]: undefined }
    }
    const res = {
      data: input.map((item) => {
        if (item && typeof item === 'object' && METADATA_KEY in item) {
          const { [METADATA_KEY]: _, ...rest } = item
          return rest as In
        }
        return item as In
      }),
      [METADATA_KEY]: getMetadata(input[0]),
    }
    return res
  }, name)
}

function getMetadata<In, Metadata>(item: In | { [METADATA_KEY]: Metadata } | undefined) {
  if (item && typeof item === 'object' && METADATA_KEY in item) {
    return item[METADATA_KEY]
  }
  return undefined
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
  BM1,
  Out,
  P2 extends ParameterMetadata,
  BM2,
  >(first: Plugin<In, I1, P1, BM1>, second: Plugin<I1, Out, P2, BM2>): PluginInvoke<In, Out, P1 & P2, BM1> {
  return (
    input: In,
    parameters: Readonly<ResolveParameters<P1 & P2>>,
    batchMetadata: BM1,
  ) => {
    const intermediateResult = first.invoke(input, parameters as Readonly<ResolveParameters<P1>>, batchMetadata)
    const nextBatchMetadata = second.batchMetadataCollector?.([intermediateResult])
    const output = second.invoke(intermediateResult, parameters as Readonly<ResolveParameters<P2>>, nextBatchMetadata)
    return output
  }
}
