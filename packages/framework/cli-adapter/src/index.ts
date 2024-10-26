import process from 'node:process'

import type { Parameter, ParameterMetadata, Plugin, StructuredOutput } from '@cm2ml/plugin'
import { getTypeConstructor } from '@cm2ml/plugin'
import { PluginAdapter } from '@cm2ml/plugin-adapter'
import { getMessage } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'
import type { Command } from 'cac'
import { cac } from 'cac'

import { batchedPluginActionHandler } from './batched-plugin-action-handler'
import { pluginActionHandler } from './plugin-action-handler'
import { loadFromFile } from './utils'

class CLI extends PluginAdapter<string[], StructuredOutput<unknown[], unknown>> {
  private readonly cli = cac('cm2ml')
    .option(
      '--out <file>',
      'Path to output file',
      { type: [undefinedAwareConstructor(String)] },
    )
    .option('--pretty', 'Pretty print JSON output', { default: false, type: [Boolean] })

  protected onApply<Parameters extends ParameterMetadata>(
    plugin: Plugin<string[], StructuredOutput<unknown[], unknown>, Parameters>,
  ) {
    this.onApplySingleInput(plugin)
    this.onApplyBatchInput(plugin)
  }

  protected onApplySingleInput<Parameters extends ParameterMetadata>(plugin: Plugin<string[], StructuredOutput<unknown[], unknown>, Parameters>) {
    const command = this.cli.command(`${plugin.name} <inputFile>`)
    const parameters: Record<string, Parameter> = { ...plugin.parameters }
    if ('continueOnError' in parameters) {
      // This parameter is only relevant for batch processing
      delete parameters.continueOnError
    }
    registerCommandOptions(command, parameters)
    command.action((inputFile: string, options: Record<string, unknown>) =>
      pluginActionHandler(plugin, inputFile, options),
    )
  }

  protected onApplyBatchInput<Parameters extends ParameterMetadata>(
    plugin: Plugin<string[], StructuredOutput<unknown[], unknown>, Parameters>,
  ) {
    const command = this.cli.command(`batch-${plugin.name} <inputDir>`)
    registerCommandOptions(command, plugin.parameters)
    command.option('--start <start>', 'Index of the first model to encode', { default: undefined, type: [undefinedAwareConstructor(Number)] })
    command.option('--limit <limit>', 'Maximum number of models to encode', { default: undefined, type: [undefinedAwareConstructor(Number)] })
    command.action((inputDir: string, options: Record<string, unknown>) =>
      batchedPluginActionHandler(plugin, inputDir, options),
    )
  }

  protected onStart() {
    try {
      this.cli.help()
      this.cli.command('').action(() => this.cli.outputHelp())
      this.cli.parse()
    } catch (error) {
      console.error(getMessage(error))
      process.exit(1)
    }
  }
}

function registerCommandOptions<Parameters extends ParameterMetadata>(
  command: Command,
  parameters: Parameters,
) {
  Stream.fromObject(parameters).forEach(([name, parameter]) => {
    if (parameter.type === 'list<string>') {
      command.option(
        `--${createOptionName(name)} <${name}>`,
        createOptionDescription(parameter),
      )
      return
    }
    if (parameter.type === 'string' && parameter.processFile !== undefined) {
      // These parameters are often too large for shell arguments, so we have to use a file instead
      command.option(
        `--${createOptionName(name)} <${name}File>`,
        createOptionDescription(parameter),
        {
          default: parameter.defaultValue,
          type: [(input: unknown) => {
            if (!input) {
              return parameter.defaultValue
            }
            const inputFile = String(input)
            if (!inputFile) {
              return parameter.defaultValue
            }
            return loadFromFile(inputFile, parameter.processFile!)
          }],
        },
      )
      return
    }
    if (parameter.type !== 'boolean') {
      command.option(
        `--${createOptionName(name)} <${name}>`,
        createOptionDescription(parameter),
        {
          default: parameter.defaultValue,
          type: [getTypeConstructor(parameter.type)],
        },
      )
      return
    }
    if (parameter.defaultValue !== true) {
      command.option(
        `--${createOptionName(name)}`,
        createOptionDescription(parameter),
        {
          default: parameter.defaultValue,
          type: [getTypeConstructor(parameter.type)],
        },
      )
    }
    if (parameter.defaultValue !== false) {
      const alteredDescription =
        parameter.description.substring(0, 1).toLowerCase() +
        parameter.description.substring(1)
      command.option(
        `--no-${createOptionName(name)}`,
        `Do not ${alteredDescription}`,
        {
          default: parameter.defaultValue,
          type: [getTypeConstructor(parameter.type)],
        },
      )
    }
  })
}

function createOptionName(parameterName: string) {
  return parameterName
    .split(/\.?(?=[A-Z])/)
    .join('-')
    .toLowerCase()
}

function createOptionDescription(parameter: Parameter) {
  if (parameter.type !== 'string') {
    return parameter.description
  }
  const allowedValues = parameter.allowedValues
  if (!allowedValues || allowedValues.length === 0) {
    return parameter.description
  }
  return `${parameter.description} (options: ${allowedValues.join(', ')})`
}

function undefinedAwareConstructor(constructor: NumberConstructor | StringConstructor | ((input: unknown) => boolean)) {
  return (input: unknown) => input === undefined ? undefined : constructor(input)
}

export function createCLI() {
  return new CLI()
}
