import { getMessage } from '@cm2ml/utils'

import type { ParameterMetadata } from './parameters'
import type { Plugin } from './plugin'
import { definePlugin } from './plugin'

/**
 * Wraps a plugin to catch errors and return a {@link ExecutionError} instead.
 */
export function trying<In, Out, Parameters extends ParameterMetadata, BatchMetadata>(plugin: Plugin<In, Out, Parameters, BatchMetadata>, name = `trying-${plugin.name}`): Plugin<In | ExecutionError, Out | ExecutionError, Parameters, BatchMetadata> {
  return definePlugin({
    name,
    parameters: plugin.parameters,
    invoke: (input: In | ExecutionError, parameters, batchMetadata) => {
      if (input instanceof ExecutionError) {
        return input
      }
      try {
        return plugin.invoke(input, parameters, batchMetadata)
      } catch (error) {
        return new ExecutionError(error, plugin.name)
      }
    },
    batchMetadataCollector: (batch: (In | ExecutionError)[], parameters) => {
      const filteredBatch = batch.filter((item) => !(item instanceof ExecutionError)) as In[]
      return plugin.batchMetadataCollector(filteredBatch, parameters)
    },
  })
}

/**
 * @returns A plugin that catches {@link ExecutionError}s and throws them as errors unless `continueOnError` is enabled.
 */
export function catching<In>() {
  return definePlugin({
    name: 'catching',
    parameters: {
      continueOnError: {
        type: 'boolean',
        defaultValue: false,
        description: 'If true, the execution will continue when encountering an error.',
      },
    },
    invoke: (input: In | ExecutionError, parameters) => {
      if (!parameters.continueOnError && input instanceof ExecutionError) {
        throw input
      }
      return input
    },
  })
}

export class ExecutionError extends Error {
  public constructor(public readonly error: unknown, public readonly pluginName: string) {
    super(getMessage(error))
  }
}
