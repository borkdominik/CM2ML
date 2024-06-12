import { getMessage } from '@cm2ml/utils'

import type { ParameterMetadata } from './parameters'
import type { Plugin } from './plugin'
import { definePlugin } from './plugin'

/**
 * Wraps a plugin to catch errors and return a {@link ExecutionError} instead.
 */
export function trying<In, Out, Parameters extends ParameterMetadata>(plugin: Plugin<In, Out, Parameters>, name = `trying-${plugin.name}`): Plugin<In | ExecutionError, Out | ExecutionError, Parameters> {
  return definePlugin({
    name,
    parameters: plugin.parameters,
    invoke: (input: In | ExecutionError, parameters) => {
      try {
        if (input instanceof ExecutionError) {
          return input
        }
        return plugin.invoke(input, parameters)
      } catch (error) {
        return new ExecutionError(error, plugin.name)
      }
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

export function throwing<In, Out, Parameters extends ParameterMetadata>(plugin: Plugin<In, Out | ExecutionError, Parameters>, name = `throwing-${plugin.name}`): Plugin<In, Out, Parameters> {
  return definePlugin({
    name,
    parameters: plugin.parameters,
    invoke: (input: In, parameters) => {
      const result = plugin.invoke(input, parameters)
      if (result instanceof ExecutionError) {
        throw result
      }
      return result
    },
  })
}

export class ExecutionError extends Error {
  public constructor(public readonly error: unknown, public readonly pluginName: string) {
    super(getMessage(error))
  }
}
