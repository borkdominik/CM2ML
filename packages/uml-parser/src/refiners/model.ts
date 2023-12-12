import { Uml } from '../uml'

import { UmlElement } from './umlElement'

export const Model = new UmlElement(
  (node) => Uml.getType(node) === Uml.Types.Model,
)
