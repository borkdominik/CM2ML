import { Uml } from '../uml'

import { Element } from './element'

// TODO
export const Model = Element.extend(
  (node) => Uml.getType(node) === Uml.Types.Model,
)
