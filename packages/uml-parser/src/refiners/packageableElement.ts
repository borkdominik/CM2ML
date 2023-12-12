import { Uml } from '../uml'

import { UmlElement } from './umlElement'

export const PackageableElement = new UmlElement(
  (node) => node.tag === Uml.Tags.packagedElement,
)
