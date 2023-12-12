import type { GraphNode } from '@cm2ml/ir'

import { Uml, type UmlTag, type UmlType } from '../uml'

import { Class } from './class'
import { Dependency } from './dependency'
import { Generalization } from './generalization'
import { Model } from './model'
import { Package } from './package'
import { PackageableElement } from './packageableElement'
import type { UmlElement } from './umlElement'

// TODO: Make non-partial?
const UmlTagRefiners: Partial<Record<UmlTag, UmlElement>> = {
  generalization: Generalization,
  packagedElement: PackageableElement,
}

// TODO: Make non-partial
const UmlTypeRefiners: Partial<Record<UmlType, UmlElement>> = {
  [Uml.Types.Class]: Class,
  [Uml.Types.Dependency]: Dependency,
  [Uml.Types.Model]: Model,
  [Uml.Types.Package]: Package,
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
