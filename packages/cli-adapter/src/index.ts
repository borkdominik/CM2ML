import fs from 'node:fs'
import process from 'node:process'

import type { ParameterMetadata, ParameterType, Plugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { cac } from 'cac'

class CLI {
  private readonly cli = cac('cm2ml').option(
    '--out-file <file>',
    'Name of output file'
  )

  public applyAll<Out, Parameters extends ParameterMetadata>(
    plugins: Plugin<Out, Parameters>[]
  ) {
    Stream.from(plugins).forEach((plugin) => this.apply(plugin))
    return this
  }

  public apply<Out, Parameters extends ParameterMetadata>(
    plugin: Plugin<Out, Parameters>
  ) {
    const command = this.cli.command(plugin.name)
    Stream.fromObject(plugin.parameters).forEach(([name, parameter]) => {
      command.option(`--${name} <${name}>`, parameter.description, {
        default: parameter.defaultValue,
        type: [getCacTypeHint(parameter.type)],
      })
    })
    command.action((options) => {
      const normalizedOptions: Record<string, unknown> & { outFile?: string } =
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

      const validationResult = plugin.validate(normalizedOptions)
      if (!validationResult.success) {
        console.error(validationResult.error)
        process.exit(1)
      }

      // TODO: Get input text
      const result = plugin.invoke('TODO', validationResult.data)
      const resultText =
        typeof result === 'string' ? result : JSON.stringify(result)

      const outFile = normalizedOptions.outFile
      if (!outFile) {
        // eslint-disable-next-line no-console
        console.log(resultText)
        return
      }

      fs.writeFileSync(outFile, resultText)
    })
    return this
  }

  public start() {
    this.cli.help().parse()
  }
}

function getCacTypeHint(parameterType: ParameterType) {
  switch (parameterType) {
    case 'number':
      return Number
    case 'string':
      return String
    case 'boolean':
      return Boolean
  }
}

export function cm2mlCLI() {
  return new CLI()
}
