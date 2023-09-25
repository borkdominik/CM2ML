import fs from 'node:fs'
import process from 'node:process'

import type { ParameterMetadata, Plugin } from '@cm2ml/plugin'
import { getTypeConstructor } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { cac } from 'cac'

class CLI {
  private readonly cli = cac('cm2ml').option(
    '--out <file>',
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
    const command = this.cli.command(`${plugin.name} <in-file>`)
    Stream.fromObject(plugin.parameters).forEach(([name, parameter]) => {
      command.option(`--${name} <${name}>`, parameter.description, {
        default: parameter.defaultValue,
        type: [getTypeConstructor(parameter.type)],
      })
    })
    command.action((inputFile: string, options: Record<string, unknown>) => {
      try {
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

        const validationResult = plugin.validate(normalizedOptions)
        if (!validationResult.success) {
          console.error(validationResult.error.message)
          process.exit(1)
        }

        const input = fs.readFileSync(inputFile, 'utf8')
        const result = plugin.invoke(input, validationResult.data)
        const resultText =
          typeof result === 'string' ? result : JSON.stringify(result)

        const outFile = normalizedOptions.out
        if (!outFile) {
          // eslint-disable-next-line no-console
          console.log(resultText)
          return
        }

        fs.writeFileSync(outFile, resultText)
      } catch (error) {
        console.error(error)
        process.exit(1)
      }
    })
    return this
  }

  public start() {
    // TODO: Prevent duplicate start
    this.cli.help().parse()
  }
}

export function createCLI() {
  return new CLI()
}
