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
  InstanceSpecification: 'InstanceSpecification',
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
function getTagType(node: GraphNode) {
  const parsedName = parseNamespace(node.tag)
  const actualName =
    typeof parsedName === 'object' ? parsedName.name : parsedName
  if (isValidType(actualName)) {
    return actualName
  }
  return undefined
}

function getTypeAttribute(node: GraphNode) {
  return node.getAttribute('type')?.value.literal
}

function getType(node: GraphNode) {
  const type = getTypeAttribute(node)
  if (isValidType(type)) {
    return type
  }
  return getTagType(node)
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
  getRawType: getTypeAttribute,
  getTypeFromTag: getTagType,
  getType,
  Attributes,
} as const

export function inferAndSaveType(node: GraphNode, type: UmlType) {
  const typeAttribute = getTypeAttribute(node)
  if (isValidType(typeAttribute)) {
    // Valid type attribute already exists
    return
  }
  if (typeAttribute === undefined) {
    // Store inferred type as attribute
    node.addAttribute({ name: 'type', value: { literal: type } })
    return
  }
  if (!Uml.isValidType(node.tag)) {
    // Store valid type as tag, because type attribute is already taken by reference
    node.tag = type
  }
}

export function copyAttributes(source: Attributable, target: Attributable) {
  source.attributes.forEach((attribute) => {
    target.addAttribute(attribute)
  })
}
