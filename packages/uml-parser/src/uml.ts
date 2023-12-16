import type { Attributable, GraphNode } from '@cm2ml/ir'
import { parseNamespace } from '@cm2ml/utils'

const Tags = {
  elementImport: 'elementImport',
  general: 'general',
  generalization: 'generalization',
  interfaceRealization: 'interfaceRealization',
  lowerValue: 'lowerValue',
  ownedAttribute: 'ownedAttribute',
  ownedOperation: 'ownedOperation',
  ownedParameter: 'ownedParameter',
  packagedElement: 'packagedElement',
  packageImport: 'packageImport',
  packageMerge: 'packageMerge',
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
  Class: 'Class',
  Dependency: 'Dependency',
  InterfaceRealization: 'InterfaceRealization',
  LiteralInteger: 'LiteralInteger',
  LiteralUnlimitedNatural: 'LiteralUnlimitedNatural',
  Model: 'Model',
  Operation: 'Operation',
  Package: 'Package',
  Parameter: 'Parameter',
  Property: 'Property',
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

function getType(node: GraphNode) {
  const type = node.getAttribute('type')?.value.literal
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
  getTypeFromTag,
  getType,
  Attributes,
} as const

export function copyAttributes(source: Attributable, target: Attributable) {
  source.attributes.forEach((attribute) => {
    target.addAttribute(attribute)
  })
}
