import { createHandlerRegistry } from '@cm2ml/metamodel'

import { umlHandlers } from './handlers/uml-handlers'
import { Uml } from './uml'

export const { inferHandler: inferUmlHandler } = createHandlerRegistry(
  Uml,
  umlHandlers,
)
