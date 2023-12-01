import type { GraphModel } from '@cm2ml/ir'
import { compose, definePlugin } from '@cm2ml/plugin'
import { XmiParser } from '@cm2ml/xmi-parser'

export const EcoreRefiner = definePlugin({
  name: 'ecore',
  parameters: {},
  invoke: (input: GraphModel) => refine(input),
})

function refine(model: GraphModel): GraphModel {
  return model
}

export const EcoreParser = compose(XmiParser, EcoreRefiner, 'ecore')
