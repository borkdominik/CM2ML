import { Uml } from '../uml'

import { Element } from './element'

// TODO
export const PackageableElement = Element.extend(
  (node) => node.tag === Uml.Tags.packagedElement,
)
