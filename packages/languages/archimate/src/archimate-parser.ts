import type { GraphModel } from '@cm2ml/ir'
import { IrPostProcessor } from '@cm2ml/ir-post-processor'
import { createRefiner } from '@cm2ml/metamodel-refiner'
import { compose, definePlugin } from '@cm2ml/plugin'
import { createXmiParser } from '@cm2ml/xmi-parser'
import { Archimate } from './metamodel/archimate'
import { inferArchimateHandler } from './metamodel/archimate-handler-registry'
import { validateArchimateModel } from './metamodel/archimate-validations'

const refine = createRefiner(Archimate, inferArchimateHandler)

export const ArchimateRefiner = definePlugin({
  name: 'archimate',
  parameters: {},
  invoke: (input: GraphModel, _parameters) => {
    input.nodes.forEach((node) => {
      if (node.tag === 'folder' && node.getAttribute('name')?.value.literal === 'Views') {
        input.removeNode(node)
      }
      console.log(node.getAttribute('xsi:type'))
    })
    const handlerParameters = {}
    const model = refine(input, handlerParameters)
    // console.log(model.root)
    validateArchimateModel(model, handlerParameters)
    return model
  },
})

export const ArchimateParser = compose(
  createXmiParser(Archimate.Attributes.id, () => {}),
  compose(ArchimateRefiner, IrPostProcessor),
  'archimate',
)
