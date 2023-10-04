import type {
  ParameterMetadata,
  PluginInvoke,
  PluginMetadata,
} from '@cm2ml/plugin'
import { BasePlugin } from '@cm2ml/plugin'
import type { XmiModel } from '@cm2ml/xmi-model'
import { parse } from '@cm2ml/xmi-parser'

export class XmiPlugin<
  Out,
  Parameters extends ParameterMetadata
> extends BasePlugin<Out, Parameters> {
  public constructor(
    name: string,
    parameters: Parameters,
    public readonly invokeWithModel: PluginInvoke<XmiModel, Out, Parameters>
  ) {
    super(name, parameters, (input, parameters) => {
      const model = parse(input)
      return invokeWithModel(model, parameters)
    })
  }
}

export function defineXmiPlugin<Out, Parameters extends ParameterMetadata>(
  data: PluginMetadata<Parameters> & {
    invoke: PluginInvoke<XmiModel, Out, Parameters>
  }
) {
  return new XmiPlugin(data.name, data.parameters, data.invoke)
}
