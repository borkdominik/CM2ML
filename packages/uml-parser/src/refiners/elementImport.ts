import { Uml } from '../uml'

import { Element } from './element'

// TODO
export const ElementImport = Element.extend(
  (node) => node.tag === Uml.Tags.elementImport,
)
