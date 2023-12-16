import type { GraphNode } from '@cm2ml/ir'

import { Uml, type UmlTag, type UmlType } from '../uml'

import { Class } from './class'
import { Dependency } from './dependency'
import type { UmlElement } from './element'
import { Generalization } from './generalization'
import { InterfaceRealization } from './interfaceRealization'
import { LowerValue } from './lowerValue'
import { Model } from './model'
import { Operation } from './operation'
import { Package } from './package'
import { PackageableElement } from './packageableElement'
import { Parameter } from './parameter'
import { Property } from './property'
import { UpperValue } from './upperValue'

// TODO: Make non-partial?
const UmlTagRefiners: Partial<Record<UmlTag, UmlElement>> = {
  generalization: Generalization,
  interfaceRealization: InterfaceRealization,
  lowerValue: LowerValue,
  ownedAttribute: Property,
  ownedOperation: Operation,
  ownedParameter: Parameter,
  packagedElement: PackageableElement,
  upperValue: UpperValue,
}

// TODO: Make non-partial
const UmlTypeRefiners: Partial<Record<UmlType, UmlElement>> = {
  [Uml.Types.Class]: Class,
  [Uml.Types.Dependency]: Dependency,
  [Uml.Types.Model]: Model,
  [Uml.Types.Operation]: Operation,
  [Uml.Types.Package]: Package,
  [Uml.Types.Parameter]: Parameter,
  [Uml.Types.Property]: Property,
}

export function getRefiner(node: GraphNode) {
  if (Uml.isValidTag(node.tag)) {
    return UmlTagRefiners[node.tag]
  }
  const type = Uml.getType(node)
  if (type) {
    return UmlTypeRefiners[type]
  }
  return undefined
}
