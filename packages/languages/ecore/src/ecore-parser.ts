import type { GraphModel } from '@cm2ml/ir'
import { IrPostProcessor } from '@cm2ml/ir-post-processor'
import { createRefiner } from '@cm2ml/metamodel-refiner'
import { compose, definePlugin } from '@cm2ml/plugin'
import { createXmiParser } from '@cm2ml/xmi-parser'

import { Ecore } from './metamodel/ecore'
import { inferEcoreHandler } from './metamodel/ecore-handler-registry'
import { validateEcoreModel } from './metamodel/ecore-validations'

const refine = createRefiner(Ecore, inferEcoreHandler)

const EcoreRefiner = definePlugin({
  name: 'ecore',
  parameters: {},
  invoke: (input: GraphModel, _parameters) => {
    const handlerParameters = {}
    const model = refine(input, handlerParameters)
    validateEcoreModel(model, handlerParameters)
    return model
  },
})

export const EcoreParser = compose(
  createXmiParser(Ecore.Attributes['xsi:id'], () => {}),
  compose(EcoreRefiner, IrPostProcessor),
  'ecore',
)
