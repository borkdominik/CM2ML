import { createHandlerRegistry } from '@cm2ml/metamodel'

import { Archimate } from './archimate'
import { archimateHandlers } from './handlers/archimate-handlers'

export const { inferHandler: inferArchimateHandler } = createHandlerRegistry(
  Archimate,
  archimateHandlers,
)
