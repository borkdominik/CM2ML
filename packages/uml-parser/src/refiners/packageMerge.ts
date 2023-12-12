import { Uml } from '../uml'

import { UmlElement } from './umlElement'

export const PackageMerge = new UmlElement(
  (node) => node.tag === Uml.Tags.packageMerge,
)
