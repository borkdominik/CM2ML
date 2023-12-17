import type { Attributable, GraphNode } from '@cm2ml/ir'
import { parseNamespace } from '@cm2ml/utils'

const Tags = {
  elementImport: 'elementImport',
  general: 'general',
  generalization: 'generalization',
  interfaceRealization: 'interfaceRealization',
  lowerValue: 'lowerValue',
  ownedAttribute: 'ownedAttribute',
  ownedLiteral: 'ownedLiteral',
  ownedOperation: 'ownedOperation',
  ownedParameter: 'ownedParameter',
  packagedElement: 'packagedElement',
  packageImport: 'packageImport',
  packageMerge: 'packageMerge',
  substitution: 'substitution',
  upperValue: 'upperValue',
} as const

export type UmlTag = (typeof Tags)[keyof typeof Tags]

function isValidTag(tag: string | undefined): tag is UmlTag {
  return tag !== undefined && tag in Tags
}

// function normalizeTag(tag: string | undefined) {
//   if (!tag) {
//     return undefined
//   }
//   let normalizedTag = tag
//   const indexOfColon = tag.indexOf(':')
//   if (indexOfColon !== -1) {
//     normalizedTag = tag.slice(indexOfColon + 1)
//   }
//   normalizedTag = normalizedTag[0]?.toLowerCase() + normalizedTag.slice(1)
//   if (isValidTag(normalizedTag)) {
//     return normalizedTag
//   }
//   return undefined
// }

const Types = {
  Abstraction: 'Abstraction',
  Association: 'Association',
  Class: 'Class',
  Comment: 'Comment',
  Constraint: 'Constraint',
  DataType: 'DataType',
  Dependency: 'Dependency',
  ElementImport: 'ElementImport',
  EnumerationLiteral: 'EnumerationLiteral',
  Enumeration: 'Enumeration',
  Generalization: 'Generalization',
  InstanceSpecfification: 'InstanceSpecification',
  Interface: 'Interface',
  InterfaceRealization: 'InterfaceRealization',
  LiteralInteger: 'LiteralInteger',
  LiteralUnlimitedNatural: 'LiteralUnlimitedNatural',
  Model: 'Model',
  Operation: 'Operation',
  Package: 'Package',
  PackageImport: 'PackageImport',
  PackageMerge: 'PackageMerge',
  Parameter: 'Parameter',
  PrimitiveType: 'PrimitiveType',
  Property: 'Property',
  Realization: 'Realization',
  Substitution: 'Substitution',
  Usage: 'Usage',
} as const

export type UmlType = (typeof Types)[keyof typeof Types]

function isValidType(type: string | undefined): type is UmlType {
  return type !== undefined && type in Types
}

// The outermost UML element may use its type as its tag
function getTypeFromTag(node: GraphNode) {
  const { name: parsedName } = parseNamespace(node.tag)
  if (isValidType(parsedName)) {
    return parsedName
  }
  return undefined
}

function getRawType(node: GraphNode) {
  return node.getAttribute('type')?.value.literal
}

function getType(node: GraphNode) {
  const type = getRawType(node)
  if (isValidType(type)) {
    return type
  }
  return undefined
}

const Attributes = {
  alias: 'alias',
  client: 'client',
  importedElement: 'importedElement',
  importedPackage: 'importedPackage',
  mergedPackage: 'mergedPackage',
  supplier: 'supplier',
  visibility: 'visibility',
} as const

export const Uml = {
  Tags,
  isValidTag,
  Types,
  isValidType,
  getRawType,
  getTypeFromTag,
  getType,
  Attributes,
} as const

export function setFallbackType(node: GraphNode, type: UmlType) {
  const currentType = getRawType(node)
  if (currentType !== undefined) {
    if (!Uml.isValidType(node.tag)) {
      node.tag = type
    }
    return
  }
  node.addAttribute({ name: 'type', value: { literal: type } })
}

export function copyAttributes(source: Attributable, target: Attributable) {
  source.attributes.forEach((attribute) => {
    target.addAttribute(attribute)
  })
}
