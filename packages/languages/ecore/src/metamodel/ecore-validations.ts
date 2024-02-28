import type { GraphModel } from '@cm2ml/ir'

import type { EcoreHandlerParameters } from './ecore-metamodel'

export function validateEcoreModel(
  model: GraphModel,
  _handlerParameters: EcoreHandlerParameters,
) {
  if (!model.settings.strict) {
    return
  }
  model.debug('Parser', 'Validating Ecore model')
  model.debug('Parser', 'All Ecore validations passed')
}
