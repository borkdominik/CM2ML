import type { GraphNode } from '@cm2ml/ir'
import { parseNamespace } from '@cm2ml/utils'

const Tags = {
  elementImport: 'elementImport',
  packagedElement: 'packagedElement',
  packageImport: 'packageImport',
  packageMerge: 'packageMerge',
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
  Model: 'Model',
  Package: 'Package',
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

// Done
function isConstraint(node: GraphNode) {
  return (
    node.tag === 'constraint' ||
    isIntervalConstraint(node) ||
    isInteractionConstraint(node)
  )
}

function isDependency(node: GraphNode) {
  return node.tag === 'dependency'
}

// Done
function isDurationConstraint(node: GraphNode) {
  return node.tag === 'durationConstraint'
}

function isElementImport(node: GraphNode) {
  return node.tag === 'elementImport'
}

function isEvent(node: GraphNode) {
  return node.tag === 'event'
}

function isGeneralizationSet(node: GraphNode) {
  return node.tag === 'generalizationSet'
}

function isInformationFlow(node: GraphNode) {
  return node.tag === 'informationFlow'
}

function isInstanceSpecification(node: GraphNode) {
  return node.tag === 'instanceSpecification'
}

// Done
function isInteractionConstraint(node: GraphNode) {
  return node.tag === 'interactionConstraint'
}

// Done
function isIntervalConstraint(node: GraphNode) {
  return (
    node.tag === 'intervalConstraint' ||
    isDurationConstraint(node) ||
    isTimeConstraint(node)
  )
}

function isNamedElement(node: GraphNode) {
  return isPackagedElement(node) // TODO: Complete
}

function isObservation(node: GraphNode) {
  return node.tag === 'observation'
}

function isPackage(node: GraphNode) {
  return node.tag === 'package'
}

function isPackageImport(node: GraphNode) {
  return node.tag === 'packageImport'
}

// Done
function isPackageMerge(node: GraphNode) {
  return node.tag === 'packageMerge'
}

function isPackagedElement(node: GraphNode) {
  return node.tag === Tags.packagedElement || isPackage(node)
}

// Done
function isTimeConstraint(node: GraphNode) {
  return node.tag === 'timeConstraint'
}

function isType(node: GraphNode) {
  return node.tag === 'type'
}

function isValueSpecification(node: GraphNode) {
  return node.tag === 'valueSpecification'
}

export const Model = {
  isConstraint,
  isDependency,
  isDurationConstraint,
  isElementImport,
  isEvent,
  isGeneralizationSet,
  isInformationFlow,
  isInstanceSpecification,
  isInteractionConstraint,
  isIntervalConstraint,
  isNamedElement,
  isObservation,
  isPackage,
  isPackageImport,
  isPackageMerge,
  isPackagedElement,
  isTimeConstraint,
  isType,
  isValueSpecification,
} as const
