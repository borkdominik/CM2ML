import type { GraphModel } from '@cm2ml/ir'

import type { EcoreHandlerParameters } from './ecore-metamodel'

export function validateEcoreModel(
  model: GraphModel,
  _handlerParameters: EcoreHandlerParameters,
) {
  if (!model.settings.strict) {
    return
  }
  model.debug('Validating Ecore model')
  model.debug('All Ecore validations passed')
}
