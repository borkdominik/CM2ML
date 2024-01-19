import type { UmlAbstractType, UmlType } from '../uml'
import type { UmlMetamodelElement } from '../uml-metamodel'

import { AbstractionHandler } from './Abstraction'
import { ActionHandler } from './Action'
import { ActivityEdgeHandler } from './ActivityEdge'
import { ActivityGroupHandler } from './ActivityGroup'
import { ActivityNodeHandler } from './ActivityNode'
import { AssociationHandler } from './Association'
import { AssociationClassHandler } from './AssociationClassHandler'
import { BehaviorHandler } from './Behavior'
import { BehavioralFeatureHandler } from './BehavioralFeature'
import { BehavioredClassifierHandler } from './BehavioredClassifier'
import { CallActionHandler } from './CallAction'
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
import { ConstraintHandler } from './Constraint'
import { ControlNodeHandler } from './ControlNode'
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
import { EventHandler } from './Event'
import { ExecutableNodeHandler } from './ExecutableNode'
import { ExecutionSpecificationHandler } from './ExecutionSpecification'
import { FeatureHandler } from './Feature'
import { FinalNodeHandler } from './FinalNode'
import { GeneralizationHandler } from './Generalization'
import { InstanceSpecificationHandler } from './InstanceSpecification'
import { InteractionFragmentHandler } from './InteractionFragment'
import { InterfaceHandler } from './Interface'
import { InterfaceRealizationHandler } from './InterfaceRealization'
import { InvocationActionHandler } from './InvocationAction'
import { LinkActionHandler } from './LinkAction'
import { LiteralIntegerHandler } from './LiteralInteger'
import { LiteralSpecificationHandler } from './LiteralSpecification'
import { LiteralUnlimitedNaturalHandler } from './LiteralUnlimitedNatural'
import { MessageEndHandler } from './MessageEnd'
import { MessageEventHandler } from './MessageEvent'
import { ModelHandler } from './Model'
import { MultiplicityElementHandler } from './MultiplicityElement'
import { NamedElementHandler } from './NamedElement'
import { NamespaceHandler } from './Namespace'
import { ObjectNodeHandler } from './ObjectNode'
import { ObservationHandler } from './Observation'
import { OperationHandler } from './Operation'
import { PackageHandler } from './Package'
import { PackageableElementHandler } from './PackageableElement'
import { PackageImportHandler } from './PackageImport'
import { PackageMergeHandler } from './PackageMerge'
import { ParameterHandler } from './Parameter'
import { ParameterableElementHandler } from './ParameterableElement'
import { PinHandler } from './Pin'
import { PortHandler } from './PortHandler'
import { PrimitiveTypeHandler } from './PrimitiveType'
import { PropertyHandler } from './Property'
import { RealizationHandler } from './Realization'
import { RedefinableElementHandler } from './RedefinableElement'
import { RelationshipHandler } from './Relationship'
import { StructuralFeatureHandler } from './StructuralFeature'
import { StructuralFeatureActionHandler } from './StructuralFeatureAction'
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
import { VariableActionHandler } from './VariableAction'
import { VertexHandler } from './Vertex'
import { WriteLinkActionHandler } from './WriteLinkAction'
import { WriteStructuralFeatureActionHandler } from './WriteStructuralFeatureAction'
import { WriteVariableActionHandler } from './WriteVariableAction'

// This record includes ALL handlers.
// Handlers MUST be added to this record, in order to properly instantiate the hierarchy chain.
export const umlHandlers: Record<
  `${UmlType | UmlAbstractType}Handler`,
  UmlMetamodelElement
> = {
  AbstractionHandler,
  ActionHandler,
  ActivityEdgeHandler,
  ActivityGroupHandler,
  ActivityNodeHandler,
  AssociationClassHandler,
  AssociationHandler,
  BehavioralFeatureHandler,
  BehavioredClassifierHandler,
  BehaviorHandler,
  CallActionHandler,
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
  ConstraintHandler,
  ControlNodeHandler,
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
  EventHandler,
  ExecutableNodeHandler,
  ExecutionSpecificationHandler,
  FeatureHandler,
  FinalNodeHandler,
  GeneralizationHandler,
  InstanceSpecificationHandler,
  InteractionFragmentHandler,
  InterfaceHandler,
  InterfaceRealizationHandler,
  InvocationActionHandler,
  LinkActionHandler,
  LiteralIntegerHandler,
  LiteralSpecificationHandler,
  LiteralUnlimitedNaturalHandler,
  MessageEndHandler,
  MessageEventHandler,
  ModelHandler,
  MultiplicityElementHandler,
  NamedElementHandler,
  NamespaceHandler,
  ObjectNodeHandler,
  ObservationHandler,
  OperationHandler,
  PackageableElementHandler,
  PackageHandler,
  PackageImportHandler,
  PackageMergeHandler,
  ParameterableElementHandler,
  ParameterHandler,
  PinHandler,
  PortHandler,
  PrimitiveTypeHandler,
  PropertyHandler,
  RealizationHandler,
  RedefinableElementHandler,
  RelationshipHandler,
  StructuralFeatureActionHandler,
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
  VariableActionHandler,
  VertexHandler,
  WriteLinkActionHandler,
  WriteStructuralFeatureActionHandler,
  WriteVariableActionHandler,
}
