import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import type { ExecutionError, Parameter, ParameterMetadata, Plugin } from '@cm2ml/plugin'
import { getTypeConstructor } from '@cm2ml/plugin'
import type { PluginAdapterConfiguration } from '@cm2ml/plugin-adapter'
import { PluginAdapter, groupBatchedOutput } from '@cm2ml/plugin-adapter'
import { getMessage } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'
import type { Command } from 'cac'
import { cac } from 'cac'

class CLI extends PluginAdapter<string, PluginAdapterConfiguration> {
  private readonly cli = cac('cm2ml')
    .option(
      '--out <file/directory>',
      'Path to output file (or directory for batched mode)',
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

  protected onApplyBatched<Out, Parameters extends ParameterMetadata>(plugin: Plugin<string[], (Out | ExecutionError)[], Parameters>) {
    const command = this.cli.command(`${plugin.name} <inputDir>`)
    registerCommandOptions(command, plugin.parameters)
    command.option('--start <start>', 'Index of the first model to encode', { default: undefined, type: [undefinedAwareConstructor(Number)] })
    command.option('--limit <limit>', 'Maximum number of models to encode', { default: undefined, type: [undefinedAwareConstructor(Number)] })
    command.action((inputFile: string, options: Record<string, unknown>) =>
      batchedPluginActionHandler(plugin, inputFile, options),
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
    if (parameter.type.startsWith('array')) {
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

function pluginActionHandler<Out, Parameters extends ParameterMetadata>(
  plugin: Plugin<string, Out, Parameters>,
  inputFile: string,
  options: Record<string, unknown>,
) {
  const normalizedOptions = normalizeOptions(options)
  const input = fs.readFileSync(inputFile, 'utf8')
  const result = plugin.validateAndInvoke(input, normalizedOptions)
  const resultText = getResultAsText(result, normalizedOptions.pretty)

  const outFile = normalizedOptions.out
  if (!outFile) {
    // eslint-disable-next-line no-console
    console.log(resultText)
    return
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, resultText)
}

function batchedPluginActionHandler<Out, Parameters extends ParameterMetadata>(
  plugin: Plugin<string[], Out[], Parameters>,
  inputDir: string,
  options: Record<string, unknown>,
) {
  const normalizedOptions = normalizeOptions(options)

  const start = typeof normalizedOptions.start === 'number' ? normalizedOptions.start : 0
  const limit = typeof normalizedOptions.limit === 'number' ? normalizedOptions.limit : undefined
  const end = limit ? start + limit : undefined

  const inputFiles = fs.readdirSync(inputDir, { encoding: 'utf8', withFileTypes: true }).filter((dirent) => dirent.isFile()).slice(start, end).map((dirent) => dirent.name)
  const input = inputFiles.map((inputFile) => fs.readFileSync(`${inputDir}/${inputFile}`, 'utf8'))

  const output = plugin.validateAndInvoke(input, normalizedOptions)
  const { results, errors } = groupBatchedOutput(output)

  const outDir = normalizedOptions.out
  if (!outDir) {
    errors.forEach(({ error, index }) => {
      console.error(`\n${inputFiles[index]}:\n ${error.message}\n`)
    })
    results.forEach(({ result, index }) => {
      const resultText = getResultAsText(result, normalizedOptions.pretty)
      // eslint-disable-next-line no-console
      console.log(`\n${inputFiles[index]}:\n${resultText}\n`)
    })
    logBatchStatistics(errors.length, results.length, output.length)
    return
  }

  fs.mkdirSync(outDir, { recursive: true })
  errors.forEach(({ error, index }) => {
    const inputFileName = inputFiles[index]
    if (!inputFileName) {
      throw new Error('Internal error. Input file is missing')
    }
    const errorFile = `${outDir}/${inputFileName}.${plugin.name}.error.txt`
    fs.writeFileSync(errorFile, error.message)
  })
  results.forEach(({ result, index }) => {
    const inputFileName = inputFiles[index]
    if (!inputFileName) {
      throw new Error('Internal error. Input file is missing')
    }
    const outFile = `${outDir}/${inputFileName}.${plugin.name}.json`
    const resultText = getResultAsText(result, normalizedOptions.pretty)
    fs.writeFileSync(outFile, resultText)
  })
  logBatchStatistics(errors.length, results.length, output.length)
}

function logBatchStatistics(errors: number, success: number, total: number) {
  if (errors > 0) {
    console.error(`\nFailed to process ${errors}/${total} inputs.`)
  } else {
    // eslint-disable-next-line no-console
    console.log(`\nSuccessfully processed ${success}/${total} inputs.`)
  }
}

function getResultAsText(result: unknown, pretty: boolean | undefined): string {
  return typeof result === 'string' ? result : JSON.stringify(result, null, pretty ? 2 : undefined)
}

function normalizeOptions(options: Record<string, unknown>): Record<string, unknown> & { out?: string, pretty?: boolean } {
  return Stream.fromObject(options)
    .map(([name, parameter]) => {
      if (Array.isArray(parameter)) {
        return [name, parameter[0]]
      } else {
        return [name, parameter]
      }
    })
    .toRecord(
      ([name]) => name,
      ([_name, value]) => value,
    )
}

function undefinedAwareConstructor(constructor: NumberConstructor | StringConstructor | ((input: unknown) => boolean)) {
  return (input: unknown) => input === undefined ? undefined : constructor(input)
}

export function createCLI() {
  return new CLI()
}
