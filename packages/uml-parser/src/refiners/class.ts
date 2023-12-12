import { Uml } from '../uml'

import { Element } from './element'

// TODO
export const Class = Element.extend(
  (node) => Uml.getType(node) === Uml.Types.Class,
)
