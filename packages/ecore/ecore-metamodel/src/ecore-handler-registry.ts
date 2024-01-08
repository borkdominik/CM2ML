import { createHandlerRegistry } from '@cm2ml/metamodel'

import { Ecore } from './ecore'
import { ecoreHandlers } from './handlers/ecore-handlers'

export const { inferHandler: inferEcoreHandler } = createHandlerRegistry(
  Ecore,
  ecoreHandlers,
)
