import type { GraphModel } from '@cm2ml/ir'
import { compose, definePlugin } from '@cm2ml/plugin'
import { XmiParser } from '@cm2ml/xmi-parser'

export const UmlRefiner = definePlugin({
  name: 'uml',
  parameters: {},
  invoke: (input: GraphModel) => refine(input),
})

function refine(model: GraphModel): GraphModel {
  return model
}

export const UmlParser = compose(XmiParser, UmlRefiner, 'uml')
