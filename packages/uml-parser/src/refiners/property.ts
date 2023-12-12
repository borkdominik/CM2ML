import { Uml } from '../uml'

import { Element } from './element'

// TODO
export const Property = Element.extend(
  (node) => Uml.getType(node) === Uml.Types.Property,
)
