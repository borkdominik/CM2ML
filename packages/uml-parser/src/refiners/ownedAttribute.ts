import { Uml } from '../uml'

import { Element } from './element'

// TODO
export const OwnedAttribute = Element.extend(
  (node) => node.tag === Uml.Tags.ownedAttribute,
)
