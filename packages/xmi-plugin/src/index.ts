import type { ParameterMetadata, ResolveParameters } from '@cm2ml/plugin'
import { Plugin } from '@cm2ml/plugin'
import type { XmiModel } from '@cm2ml/xmi-model'
import { parse } from '@cm2ml/xmi-parser'

export class XmiPlugin<
  Out,
  Parameters extends ParameterMetadata
> extends Plugin<Out, Parameters> {
  public constructor(
    name: string,
    parameters: Parameters,
    onInvoke: (
      input: XmiModel,
      parameters: Readonly<ResolveParameters<Parameters>>
    ) => Out
  ) {
    super(name, parameters, (input, parameters) => {
      const model = parse(input)
      return onInvoke(model, parameters)
    })
  }
}

export function defineXmiPlugin<Out, Parameters extends ParameterMetadata>(
  data: Omit<Plugin<Out, Parameters>, 'invoke'> & {
    onInvoke: (
      input: XmiModel,
      parameters: Readonly<ResolveParameters<Parameters>>
    ) => Out
  }
): XmiPlugin<Out, Parameters> {
  return new XmiPlugin(data.name, data.parameters, data.onInvoke)
}
