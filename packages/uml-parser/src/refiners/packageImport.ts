import { Uml } from '../uml'

import { UmlElement } from './umlElement'

export const PackageImport = new UmlElement(
  (node) => node.tag === Uml.Tags.packageImport,
)
