import type { GraphModel } from '@cm2ml/ir'

import type { ArchimateHandlerParameters } from './archimate-metamodel'

export function validateArchimateModel(
  model: GraphModel,
  _handlerParameters: ArchimateHandlerParameters,
) {
  if (!model.settings.strict || !model.settings.debug) {
    return
  }
  model.debug('Parser', 'Validating ArchiMate model...')
  // Add validations here (currently none)
  model.debug('Parser', 'All ArchiMate validations passed')
}
