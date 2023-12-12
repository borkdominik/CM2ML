import type { GraphNode } from '@cm2ml/ir'

import { Uml, type UmlTag, type UmlType } from '../uml'

import { refinePackage } from './nodes/package'
import { refinePackagedElement } from './nodes/packagedElement'

// TODO: Remove
function noop() {}

// TODO: Make non-partial
const UmlTagRefiners: Partial<Record<UmlTag, (node: GraphNode) => void>> = {
  elementImport: noop,
  package: refinePackage,
  packagedElement: refinePackagedElement,
  packageImport: noop,
  packageMerge: noop,
}

// TODO: Make non-partial
const UmlTypeRefiners: Partial<Record<UmlType, (node: GraphNode) => void>> = {
  [Uml.Types.Class]: noop,
  [Uml.Types.Model]: noop,
  [Uml.Types.Package]: refinePackage,
}

export function getRefiner(node: GraphNode) {
  const type = Uml.getUmlType(node)
  if (type) {
    return UmlTypeRefiners[type]
  }
  if (Uml.isValidTag(node.tag)) {
    return UmlTagRefiners[node.tag]
  }
  return undefined
}
