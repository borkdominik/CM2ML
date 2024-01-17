import type { UmlAbstractType, UmlTag, UmlType } from '../uml'
import type { UmlMetamodelElement } from '../uml-metamodel'

import { AbstractionHandler } from './Abstraction'
import { AssociationHandler } from './Association'
import { AssociationClassHandler } from './AssociationClassHandler'
import { BehavioralFeatureHandler } from './BehavioralFeature'
import { BehavioredClassifierHandler } from './BehavioredClassifier'
import { ClassHandler } from './Class'
import { ClassifierHandler } from './Classifier'
import { CollaborationHandler } from './CollaborationHandler'
import { CollaborationUseHandler } from './CollaborationUseHandler'
import { CommentHandler } from './Comment'
import { ComponentHandler } from './Component'
import { ComponentRealizationHandler } from './ComponentRealizationHandler'
import { ConnectableElementHandler } from './ConnectableElement'
import { ConnectableElementTemplateParameterHandler } from './ConnectableElementTemplateParameter'
import { ConnectorHandler } from './Connector'
import { ConnectorEndHandler } from './ConnectorEnd'
import { ConnectorKindHandler } from './ConnectorKind'
import { ConstraintHandler } from './Constraint'
import { DataTypeHandler } from './DataType'
import { DependencyHandler } from './Dependency'
import { DeployedArtifactHandler } from './DeployedArtifact'
import { DeploymentTargetHandler } from './DeploymentTarget'
import { DirectedRelationshipHandler } from './DirectedRelationship'
import { ElementHandler } from './Element'
import { ElementImportHandler } from './ElementImport'
import { EncapsulatedClassifierHandler } from './EncapsulatedClassifier'
import { EnumerationHandler } from './Enumeration'
import { EnumerationLiteralHandler } from './EnumerationLiteral'
import { FeatureHandler } from './Feature'
import { GeneralizationHandler } from './Generalization'
import { InstanceSpecificationHandler } from './InstanceSpecification'
import { InterfaceHandler } from './Interface'
import { InterfaceRealizationHandler } from './InterfaceRealization'
import { LiteralIntegerHandler } from './LiteralInteger'
import { LiteralSpecificationHandler } from './LiteralSpecification'
import { LiteralUnlimitedNaturalHandler } from './LiteralUnlimitedNatural'
import { ModelHandler } from './Model'
import { MultiplicityElementHandler } from './MultiplicityElement'
import { NamedElementHandler } from './NamedElement'
import { NamespaceHandler } from './Namespace'
import { OperationHandler } from './Operation'
import { PackageHandler } from './Package'
import { PackageableElementHandler } from './PackageableElement'
import { PackageImportHandler } from './PackageImport'
import { PackageMergeHandler } from './PackageMerge'
import { ParameterHandler } from './Parameter'
import { ParameterableElementHandler } from './ParameterableElement'
import { PortHandler } from './PortHandler'
import { PrimitiveTypeHandler } from './PrimitiveType'
import { PropertyHandler } from './Property'
import { RealizationHandler } from './Realization'
import { RedefinableElementHandler } from './RedefinableElement'
import { RelationshipHandler } from './Relationship'
import { StructuralFeatureHandler } from './StructuralFeature'
import { StructuredClassifierHandler } from './StructuredClassifier'
import { SubstitutionHandler } from './Substitution'
import { TemplateableElementHandler } from './TemplateableElement'
import { TemplateBindingHandler } from './TemplateBinding'
import { TemplateParameterHandler } from './TemplateParameter'
import { TemplateParameterSubstitutionHandler } from './TemplateParameterSubstitution'
import { TemplateSignatureHandler } from './TemplateSignature'
import { TypeHandler } from './Type'
import { TypedElementHandler } from './TypedElement'
import { UsageHandler } from './Usage'
import { ValueSpecificationHandler } from './ValueSpecification'

// This record includes ALL handlers.
// Handlers MUST be added to this record, in order to properly instantiate the hierarchy chain.
export const umlHandlers: Record<
  `${UmlType | UmlAbstractType}Handler`,
  UmlMetamodelElement
> &
  Partial<Record<`${UmlTag}Handler`, UmlMetamodelElement>> = {
  AbstractionHandler,
  AssociationClassHandler,
  AssociationHandler,
  BehavioralFeatureHandler,
  BehavioredClassifierHandler,
  ClassHandler,
  ClassifierHandler,
  CollaborationHandler,
  CollaborationUseHandler,
  CommentHandler,
  ComponentHandler,
  ComponentRealizationHandler,
  ConnectableElementHandler,
  ConnectableElementTemplateParameterHandler,
  ConnectorEndHandler,
  ConnectorHandler,
  ConnectorKindHandler,
  ConstraintHandler,
  DataTypeHandler,
  DependencyHandler,
  DeployedArtifactHandler,
  DeploymentTargetHandler,
  DirectedRelationshipHandler,
  ElementHandler,
  ElementImportHandler,
  EncapsulatedClassifierHandler,
  EnumerationHandler,
  EnumerationLiteralHandler,
  FeatureHandler,
  GeneralizationHandler,
  InstanceSpecificationHandler,
  InterfaceHandler,
  InterfaceRealizationHandler,
  LiteralIntegerHandler,
  LiteralSpecificationHandler,
  LiteralUnlimitedNaturalHandler,
  ModelHandler,
  MultiplicityElementHandler,
  NamedElementHandler,
  NamespaceHandler,
  OperationHandler,
  PackageableElementHandler,
  PackageHandler,
  PackageImportHandler,
  PackageMergeHandler,
  ParameterableElementHandler,
  ParameterHandler,
  PortHandler,
  PrimitiveTypeHandler,
  PropertyHandler,
  RealizationHandler,
  RedefinableElementHandler,
  RelationshipHandler,
  StructuralFeatureHandler,
  StructuredClassifierHandler,
  SubstitutionHandler,
  TemplateableElementHandler,
  TemplateBindingHandler,
  TemplateParameterHandler,
  TemplateParameterSubstitutionHandler,
  TemplateSignatureHandler,
  TypedElementHandler,
  TypeHandler,
  UsageHandler,
  ValueSpecificationHandler,
}
