import { Uml } from '../uml'

import { UmlElement } from './umlElement'

export const ElementImport = new UmlElement(
  (node) => node.tag === Uml.Tags.elementImport,
)
