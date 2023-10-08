import type {
  ParameterMetadata,
  PluginInvoke,
  PluginMetadata,
} from '@cm2ml/plugin'
import { compose, definePlugin } from '@cm2ml/plugin'
import type { XmiModel } from '@cm2ml/xmi-model'
import { parse } from '@cm2ml/xmi-parser'

export const XmiTransformer = definePlugin({
  name: 'xmi-transformer',
  parameters: {},
  invoke: (input: string) => parse(input),
})

export function defineXmiPlugin<Out, Parameters extends ParameterMetadata>(
  data: PluginMetadata<Parameters> & {
    invoke: PluginInvoke<XmiModel, Out, Parameters>
  }
) {
  const plugin = definePlugin(data)
  return compose(XmiTransformer, plugin)
}
