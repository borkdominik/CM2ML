import fs from 'node:fs'
import process from 'node:process'

import type { Parameter, ParameterMetadata, Plugin } from '@cm2ml/plugin'
import { PluginAdapter, getTypeConstructor } from '@cm2ml/plugin'
import { getMessage } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'
import { cac } from 'cac'

class CLI extends PluginAdapter<string> {
  private readonly cli = cac('cm2ml').option(
    '--out <file>',
    'Path to output file'
  )

  protected onApply<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<string, Out, Parameters>
  ) {
    const command = this.cli.command(`${plugin.name} <inputFile>`)
    Stream.fromObject(plugin.parameters).forEach(([name, parameter]) => {
      if (parameter.type !== 'boolean') {
        command.option(
          `--${createOptionName(name)} <${name}>`,
          createOptionDescription(parameter),
          {
            default: parameter.defaultValue,
            type: [getTypeConstructor(parameter.type)],
          }
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
          }
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
          }
        )
      }
    })
    command.action((inputFile: string, options: Record<string, unknown>) =>
      pluginActionHandler(plugin, inputFile, options)
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
  options: Record<string, unknown>
) {
  const normalizedOptions: Record<string, unknown> & { out?: string } =
    Stream.fromObject(options)
      .map(([name, parameter]) => {
        if (Array.isArray(parameter)) {
          return [name, parameter[0]]
        } else return [name, parameter]
      })
      .toRecord(
        ([name]) => name,
        ([_name, value]) => value
      )

  const input = fs.readFileSync(inputFile, 'utf8')
  const result = plugin.validateAndInvoke(input, normalizedOptions)
  const resultText =
    typeof result === 'string' ? result : JSON.stringify(result)

  const outFile = normalizedOptions.out
  if (!outFile) {
    // eslint-disable-next-line no-console
    console.log(resultText)
    return
  }

  fs.writeFileSync(outFile, resultText)
}

export function createCLI() {
  return new CLI()
}
