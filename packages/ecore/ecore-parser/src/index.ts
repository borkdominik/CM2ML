import {
  Ecore,
  inferEcoreHandler,
  validateEcoreModel,
} from '@cm2ml/ecore-metamodel'
import type { GraphModel } from '@cm2ml/ir'
import { IrPostProcessor } from '@cm2ml/ir-post-processor'
import { createRefiner } from '@cm2ml/metamodel-refiner'
import { compose, definePlugin } from '@cm2ml/plugin'
import { XmiParser } from '@cm2ml/xmi-parser'

const refine = createRefiner(Ecore, inferEcoreHandler)

export const EcoreRefiner = definePlugin({
  name: 'ecore',
  parameters: {
    idAttribute: {
      ...XmiParser.parameters.idAttribute,
      defaultValue: 'xsi:id',
    },
  },
  invoke: (input: GraphModel, _parameters) => {
    const handlerParameters = {}
    const model = refine(input, handlerParameters)
    validateEcoreModel(model, handlerParameters)
    return model
  },
})

export const EcoreParser = compose(
  XmiParser,
  compose(EcoreRefiner, IrPostProcessor),
  'ecore',
)
