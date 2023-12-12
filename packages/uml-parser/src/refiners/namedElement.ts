import { Uml } from '../uml'

import { Element } from './element'

// TODO
export const NamedElement = Element.extend(
  (node) => node.tag === Uml.Tags.packagedElement,
)
