import type { GraphNode } from '@cm2ml/ir'

import { Uml, type UmlTag, type UmlType } from '../uml'

import { Class } from './class'
import { Dependency } from './dependency'
import type { UmlElement } from './element'
import { Generalization } from './generalization'
import { Model } from './model'
import { OwnedAttribute } from './ownedAttribute'
import { Package } from './package'
import { PackageableElement } from './packageableElement'
import { Property } from './property'

// TODO: Make non-partial?
const UmlTagRefiners: Partial<Record<UmlTag, UmlElement>> = {
  generalization: Generalization,
  ownedAttribute: OwnedAttribute,
  packagedElement: PackageableElement,
}

// TODO: Make non-partial
const UmlTypeRefiners: Partial<Record<UmlType, UmlElement>> = {
  [Uml.Types.Class]: Class,
  [Uml.Types.Dependency]: Dependency,
  [Uml.Types.Model]: Model,
  [Uml.Types.Package]: Package,
  [Uml.Types.Property]: Property,
}

export function getRefiner(node: GraphNode) {
  const type = Uml.getType(node)
  if (type) {
    return UmlTypeRefiners[type]
  }
  if (Uml.isValidTag(node.tag)) {
    return UmlTagRefiners[node.tag]
  }
  return undefined
}
