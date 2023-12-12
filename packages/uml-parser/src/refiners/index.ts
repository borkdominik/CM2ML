import type { GraphNode } from '@cm2ml/ir'

import { Uml, type UmlTag, type UmlType } from '../uml'

import { Dependency } from './nodes/dependency'
import { Package } from './nodes/package'
import { PackageableElement } from './nodes/packageableElement'
import { UmlElement } from './refiner'

// TODO: Remove
class Noop extends UmlElement {
  public isApplicable(_node: GraphNode): boolean {
    return false
  }
}

// TODO: Remove
const noop = new Noop()

// TODO: Make non-partial
const UmlTagRefiners: Partial<Record<UmlTag, UmlElement>> = {
  // elementImport: noop,
  packagedElement: new PackageableElement(),
  // packageImport: noop,
  // packageMerge: noop,
}

// TODO: Make non-partial
const UmlTypeRefiners: Partial<Record<UmlType, UmlElement>> = {
  [Uml.Types.Class]: noop,
  [Uml.Types.Dependency]: new Dependency(),
  [Uml.Types.Model]: noop,
  [Uml.Types.Package]: new Package(),
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
