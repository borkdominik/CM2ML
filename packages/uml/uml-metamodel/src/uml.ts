import type { Attributable, GraphNode } from '@cm2ml/ir'
import { parseNamespace } from '@cm2ml/utils'

const Attributes = {
  aggregation: 'aggregation',
  alias: 'alias',
  body: 'body',
  client: 'client',
  concurrency: 'concurrency',
  contract: 'contract',
  direction: 'direction',
  general: 'general',
  importedElement: 'importedElement',
  importedPackage: 'importedPackage',
  isAbstract: 'isAbstract',
  isActive: 'isActive',
  isBehavior: 'isBehavior',
  isComposite: 'isComposite',
  isConjugated: 'isConjugated',
  isDerived: 'isDerived',
  isDerivedUnion: 'isDerivedUnion',
  isFinalSpecialization: 'isFinalSpecialization',
  isException: 'isException',
  isID: 'isID',
  isIndirectlyInstantiated: 'isIndirectlyInstantiated',
  isLeaf: 'isLeaf',
  isOrdered: 'isOrdered',
  isQuery: 'isQuery',
  isReadOnly: 'isReadOnly',
  isService: 'isService',
  isStatic: 'isStatic',
  isStream: 'isStream',
  isSubstitutable: 'isSubstitutable',
  isUnique: 'isUnique',
  lower: 'lower',
  mergedPackage: 'mergedPackage',
  name: 'name',
  supplier: 'supplier',
  type: 'type',
  upper: 'upper',
  URI: 'URI',
  value: 'value',
  visibility: 'visibility',
  'xmi:id': 'xmi:id',
  'xmi:type': 'xmi:type',
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

const AbstractTypes = {
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
  StructuredClassifier: 'StructuredClassifier',
  TemplateableElement: 'TemplateableElement',
  Type: 'Type',
  TypedElement: 'TypedElement',
  ValueSpecification: 'ValueSpecification',
} as const

export type UmlAbstractType = (typeof AbstractTypes)[keyof typeof AbstractTypes]

const Types = {
  Abstraction: 'Abstraction',
  Association: 'Association',
  AssociationClass: 'AssociationClass',
  Class: 'Class',
  Collaboration: 'Collaboration',
  CollaborationUse: 'CollaborationUse',
  Comment: 'Comment',
  Component: 'Component',
  ComponentRealization: 'ComponentRealization',
  ConnectableElementTemplateParameter: 'ConnectableElementTemplateParameter',
  Connector: 'Connector',
  ConnectorEnd: 'ConnectorEnd',
  ConnectorKind: 'ConnectorKind',
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
  Port: 'Port',
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

// The root element may use its type as its tag
function getTagType(node: GraphNode) {
  const parsedName = parseNamespace(node.tag)
  const actualName =
    typeof parsedName === 'object' ? parsedName.name : parsedName
  if (isValidType(actualName)) {
    return actualName
  }
  return undefined
}

function getType(node: Attributable) {
  const type = node.getAttribute(Attributes['xmi:type'])?.value.literal
  if (isValidType(type)) {
    return type
  }
  return undefined
}

const relationshipToEdgeTag: Partial<Record<UmlType, string>> = {
  [Types.Abstraction]: 'abstraction',
  [Types.ComponentRealization]: 'componentRealization',
  [Types.Dependency]: 'dependency',
  [Types.Generalization]: 'generalization',
  [Types.InterfaceRealization]: 'interfaceRealization',
  [Types.PackageImport]: 'packageImport',
  [Types.PackageMerge]: 'packageMerge',
  [Types.Realization]: 'realization',
  [Types.Substitution]: 'substitution',
  [Types.Usage]: 'usage',
}

function getEdgeTagForRelationship(relationship: GraphNode) {
  const type = getType(relationship)
  if (!type) {
    throw new Error(`Could not determine type for ${relationship.id}`)
  }
  const tag = relationshipToEdgeTag[type]
  if (!tag) {
    throw new Error(
      `Could not determine edge tag for ${relationship.id} with original tag ${relationship.tag}`,
    )
  }
  return tag
}

export const Uml = {
  AbstractTypes,
  Attributes,
  Tags,
  Types,
  typeAttributeName: Attributes['xmi:type'],
  isValidTag,
  isValidType,
  getTagType,
  getType,
  getEdgeTagForRelationship,
} as const
