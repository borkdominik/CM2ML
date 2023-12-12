import { Uml } from '../uml'

import { Element } from './element'

// TODO
export const PackageMerge = Element.extend(
  (node) => node.tag === Uml.Tags.packageMerge,
)
