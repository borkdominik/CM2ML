import process from 'node:process'

import type { ParameterMetadata, ParameterType, Plugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { cac } from 'cac'

class CLI {
  private readonly cli = cac('cm2ml')

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
      for (const [name, parameter] of Stream.fromObject(options)) {
        if (Array.isArray(parameter)) {
          options[name] = parameter[0]
        }
      }

      const validationResult = plugin.validate(options)
      if (!validationResult.success) {
        console.error(validationResult.error)
        process.exit(1)
      }

      // TODO: Get input text
      const result = plugin.invoke('TODO', validationResult.data)
      // eslint-disable-next-line no-console
      console.log(result)
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
