import type { GraphNode } from '@cm2ml/ir'
import { parseNamespace } from '@cm2ml/utils'

const Attributes = {
  alias: 'alias',
  body: 'body',
  client: 'client',
  contract: 'contract',
  general: 'general',
  importedElement: 'importedElement',
  importedPackage: 'importedPackage',
  lower: 'lower',
  mergedPackage: 'mergedPackage',
  supplier: 'supplier',
  type: 'type',
  upper: 'upper',
  value: 'value',
  visibility: 'visibility',
  xmiType: 'xmi:type',
} as const

const Tags = {
  body: 'body',
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

export const AbstractTypes = {
  BehavioralFeature: 'BehavioralFeature',
  BehavioredClassifier: 'BehavioredClassifier',
  Classifier: 'Classifier',
  ConnectableElement: 'ConnectableElement',
  DeployedArtifact: 'DeployedArtifact',
  DeploymentTarget: 'DeploymentTarget',
  DirectedRelationship: 'DirectedRelationship',
  Element: 'Element',
  EncapsulatedClassifier: 'EncapsulatedClassifier',
  Feature: 'Feature',
  LiteralSpecification: 'LiteralSpecification',
  MultiplicityElement: 'MultiplicityElement',
  NamedElement: 'NamedElement',
  Namespace: 'Namespace',
  PackageableElement: 'PackageableElement',
  ParameterableElement: 'ParameterableElement',
  RedefinableElement: 'RedefinableElement',
  Relationship: 'Relationship',
  StructuralFeature: 'StructuralFeature',
  TemplateableElement: 'TemplateableElement',
  Type: 'Type',
  TypedElement: 'TypedElement',
  ValueSpecification: 'ValueSpecification',
} as const

export type UmlAbstractType = (typeof AbstractTypes)[keyof typeof AbstractTypes]

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
  TemplateBinding: 'TemplateBinding',
  TemplateParameter: 'TemplateParameter',
  TemplateParameterSubstitution: 'TemplateParameterSubstitution',
  TemplateSignature: 'TemplateSignature',
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

function getType(node: GraphNode) {
  const type = node.getAttribute(Attributes.xmiType)?.value.literal
  if (isValidType(type)) {
    return type
  }
  return undefined
}

export const Uml = {
  Tags,
  isValidTag,
  AbstractTypes,
  Types,
  isValidType,
  getTagType,
  getType,
  Attributes,
} as const

export function inferAndSaveType(node: GraphNode, type: UmlType) {
  const currentType = getType(node)
  if (isValidType(currentType)) {
    // Valid type attribute already exists
    return
  }
  if (currentType !== undefined && node.model.settings.strict) {
    throw new Error(`Node ${node.id} has invalid type ${currentType}`)
  }
  node.addAttribute({
    name: Attributes.xmiType,
    value: { literal: type },
  })
}

// export function copyAttributes(source: Attributable, target: Attributable) {
//   source.attributes.forEach((attribute) => {
//     target.addAttribute(attribute)
//   })
// }
