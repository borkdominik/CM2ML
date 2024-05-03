import { existsSync } from 'node:fs'
import process from 'node:process'

import type { ExecutionError, METADATA_KEY, Parameter, ParameterMetadata, Plugin } from '@cm2ml/plugin'
import { getTypeConstructor } from '@cm2ml/plugin'
import type { PluginAdapterConfiguration } from '@cm2ml/plugin-adapter'
import { PluginAdapter } from '@cm2ml/plugin-adapter'
import { getMessage } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'
import type { Command } from 'cac'
import { cac } from 'cac'

import { batchedPluginActionHandler } from './batched-plugin-action-handler'
import { getFeatureMetadataFromFile } from './feature-metadata-extractor'
import { pluginActionHandler } from './plugin-action-handler'

class CLI extends PluginAdapter<string, PluginAdapterConfiguration> {
  private readonly cli = cac('cm2ml')
    .option(
      '--out <file/directory>',
      'Path to output file (or directory for non-merged batch mode)',
      { type: [undefinedAwareConstructor(String)] },
    )
    .option('--pretty', 'Pretty print JSON output', { default: false, type: [Boolean] })

  protected onApply<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<string, Out, Parameters>,
  ) {
    const command = this.cli.command(`${plugin.name} <inputFile>`)
    registerCommandOptions(command, plugin.parameters)
    command.action((inputFile: string, options: Record<string, unknown>) =>
      pluginActionHandler(plugin, inputFile, options),
    )
  }

  protected onApplyBatched<Out, Parameters extends ParameterMetadata>(plugin: Plugin<string[], { data: (Out | ExecutionError)[], [METADATA_KEY]: unknown }, Parameters>) {
    const command = this.cli.command(`${plugin.name} <inputDir>`)
    registerCommandOptions(command, plugin.parameters)
    command.option('--merge', 'Merge all results into a single output', { default: false, type: [Boolean] })
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
    if (parameter.type === 'array<string>') {
      command.option(
          `--${createOptionName(name)} <${name}>`,
          createOptionDescription(parameter),
          {
            // type: [getTypeConstructor('array<string>')],
          },
      )
      return
    }
    if (parameter.type === 'string' && ['nodeFeatures', 'edgeFeatures'].includes(name)) {
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
              try {
                // check if the file exists
                if (!existsSync(inputFile)) {
                  return inputFile
                }
              } catch (error) {
                return inputFile
              }
              return getFeatureMetadataFromFile(inputFile, `__metadata__.${name}`)
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
