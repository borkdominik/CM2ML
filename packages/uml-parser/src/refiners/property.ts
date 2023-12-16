import { Uml } from '../uml'

import { StructuralFeature } from './structuralFeature'

// TODO
export const Property = StructuralFeature.extend(
  (node) =>
    Uml.getType(node) === Uml.Types.Property ||
    node.tag === Uml.Tags.ownedAttribute,
  (node) => {
    node.tag = Uml.Types.Property
  },
)
