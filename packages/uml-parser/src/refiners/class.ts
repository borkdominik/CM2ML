import { Uml } from '../uml'

import { UmlElement } from './umlElement'

export const Class = new UmlElement(
  (node) => Uml.getType(node) === Uml.Types.Class,
)
