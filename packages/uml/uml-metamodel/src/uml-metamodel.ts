import type { HandlerPropagation, MetamodelElement } from '@cm2ml/metamodel'
import { createMetamodel } from '@cm2ml/metamodel'

import { Uml, type UmlAbstractType, type UmlTag, type UmlType } from './uml'

export interface UmlHandlerParameters extends HandlerPropagation {
  onlyContainmentAssociations: boolean
  relationshipsAsEdges: boolean
}

export type UmlMetamodelElement = MetamodelElement<
  UmlType,
  UmlAbstractType,
  UmlTag,
  UmlHandlerParameters
>

const { define, defineAbstract } = createMetamodel<
  UmlType,
  UmlAbstractType,
  UmlTag,
  UmlHandlerParameters
>(Uml)

// TODO: Include [Enumeration] elements?

export const Element = defineAbstract(Uml.AbstractTypes.Element)

export const NamedElement = defineAbstract(
  Uml.AbstractTypes.NamedElement,
  Element,
)

export const Namespace = defineAbstract(
  Uml.AbstractTypes.Namespace,
  NamedElement,
)

export const RedefinableElement = defineAbstract(
  Uml.AbstractTypes.RedefinableElement,
  NamedElement,
)

export const TemplateableElement = defineAbstract(
  Uml.AbstractTypes.TemplateableElement,
  Element,
)

export const ParameterableElement = defineAbstract(
  Uml.AbstractTypes.ParameterableElement,
  Element,
)

export const PackageableElement = defineAbstract(
  Uml.AbstractTypes.PackageableElement,
  ParameterableElement,
  NamedElement,
)

export const Type = defineAbstract(Uml.AbstractTypes.Type, PackageableElement)

export const Classifier = defineAbstract(
  Uml.AbstractTypes.Classifier,
  Namespace,
  Type,
  TemplateableElement,
  RedefinableElement,
)

export const BehavioredClassifier = defineAbstract(
  Uml.AbstractTypes.BehavioredClassifier,
  Classifier,
)

export const StructuredClassifier = defineAbstract(
  Uml.AbstractTypes.StructuredClassifier,
  Classifier,
)

export const EncapsulatedClassifier = defineAbstract(
  Uml.AbstractTypes.EncapsulatedClassifier,
  StructuredClassifier,
)

export const Class = define(
  Uml.Types.Class,
  undefined,
  BehavioredClassifier,
  EncapsulatedClassifier,
)

export const TypedElement = defineAbstract(
  Uml.AbstractTypes.TypedElement,
  NamedElement,
)

export const ConnectableElement = defineAbstract(
  Uml.AbstractTypes.ConnectableElement,
  TypedElement,
  ParameterableElement,
)

export const MultiplicityElement = defineAbstract(
  Uml.AbstractTypes.MultiplicityElement,
  Element,
)

export const Parameter = define(
  Uml.Types.Parameter,
  Uml.Tags.ownedParameter,
  ConnectableElement,
  MultiplicityElement,
)

export const Feature = defineAbstract(
  Uml.AbstractTypes.Feature,
  RedefinableElement,
)

export const BehavioralFeature = defineAbstract(
  Uml.AbstractTypes.BehavioralFeature,
  Feature,
  Namespace,
)

export const Operation = define(
  Uml.Types.Operation,
  Uml.Tags.ownedOperation,
  TemplateableElement,
  ParameterableElement,
  BehavioralFeature,
)

export const Relationship = defineAbstract(
  Uml.AbstractTypes.Relationship,
  Element,
)

export const DirectedRelationship = defineAbstract(
  Uml.AbstractTypes.DirectedRelationship,
  Relationship,
)

export const Dependency = define(
  Uml.Types.Dependency,
  undefined,
  DirectedRelationship,
  PackageableElement,
)

export const Abstraction = define(Uml.Types.Abstraction, undefined, Dependency)

export const Comment = define(Uml.Types.Comment, undefined, Element)

export const Constraint = define(
  Uml.Types.Constraint,
  undefined,
  PackageableElement,
)

export const ElementImport = define(
  Uml.Types.ElementImport,
  Uml.Tags.elementImport,
  DirectedRelationship,
)

export const PackageImport = define(
  Uml.Types.PackageImport,
  Uml.Tags.packageImport,
  DirectedRelationship,
)

export const PackageMerge = define(
  Uml.Types.PackageMerge,
  Uml.Tags.packageMerge,
  DirectedRelationship,
)

export const Realization = define(Uml.Types.Realization, undefined, Abstraction)

export const TemplateBinding = define(
  Uml.Types.TemplateBinding,
  undefined,
  DirectedRelationship,
)

export const TemplateParameter = define(
  Uml.Types.TemplateParameter,
  undefined,
  Element,
)

export const TemplateParameterSubstitution = define(
  Uml.Types.TemplateParameterSubstitution,
  undefined,
  Element,
)

export const TemplateSignature = define(
  Uml.Types.TemplateSignature,
  undefined,
  Element,
)

export const Usage = define(Uml.Types.Usage, undefined, Dependency)

export const Package = define(
  Uml.Types.Package,
  undefined,
  PackageableElement,
  TemplateableElement,
  Namespace,
)

export const InterfaceRealization = define(
  Uml.Types.InterfaceRealization,
  Uml.Tags.interfaceRealization,
  Realization,
)

export const Generalization = define(
  Uml.Types.Generalization,
  Uml.Tags.generalization,
  DirectedRelationship,
)

export const ValueSpecification = defineAbstract(
  Uml.AbstractTypes.ValueSpecification,
  TypedElement,
  PackageableElement,
)

export const DeploymentTarget = defineAbstract(
  Uml.AbstractTypes.DeploymentTarget,
  NamedElement,
)

export const StructuralFeature = defineAbstract(
  Uml.AbstractTypes.StructuralFeature,
  MultiplicityElement,
  TypedElement,
  Feature,
)

export const Property = define(
  Uml.Types.Property,
  Uml.Tags.ownedAttribute,
  ConnectableElement,
  DeploymentTarget,
  StructuralFeature,
)

export const LiteralSpecification = defineAbstract(
  Uml.AbstractTypes.LiteralSpecification,
  ValueSpecification,
)

export const LiteralInteger = define(
  Uml.Types.LiteralInteger,
  undefined,
  LiteralSpecification,
)

export const LiteralUnlimitedNatural = define(
  Uml.Types.LiteralUnlimitedNatural,
  undefined,
  LiteralSpecification,
)

export const Model = define(Uml.Types.Model, undefined, Package)

export const DataType = define(Uml.Types.DataType, undefined, Classifier)

export const PrimitiveType = define(
  Uml.Types.PrimitiveType,
  undefined,
  DataType,
)

export const DeployedArtifact = defineAbstract(
  Uml.AbstractTypes.DeployedArtifact,
  NamedElement,
)

export const InstanceSpecification = define(
  Uml.Types.InstanceSpecification,
  undefined,
  DeploymentTarget,
  PackageableElement,
  DeployedArtifact,
)

export const Enumeration = define(Uml.Types.Enumeration, undefined, DataType)

export const EnumerationLiteral = define(
  Uml.Types.EnumerationLiteral,
  Uml.Tags.ownedLiteral,
  InstanceSpecification,
)

export const Interface = define(Uml.Types.Interface, undefined, Classifier)

export const Substitution = define(
  Uml.Types.Substitution,
  Uml.Tags.substitution,
  Realization,
)

export const Association = define(
  Uml.Types.Association,
  undefined,
  Relationship,
  Classifier,
)

export const AssociationClass = define(
  Uml.Types.AssociationClass,
  undefined,
  Association,
  Class,
)

export const Collaboration = define(
  Uml.Types.Collaboration,
  undefined,
  StructuredClassifier,
  BehavioredClassifier,
)

export const CollaborationUse = define(
  Uml.Types.CollaborationUse,
  undefined,
  NamedElement,
)

export const Component = define(Uml.Types.Component, undefined, Class)

export const ComponentRealization = define(
  Uml.Types.ComponentRealization,
  undefined,
  Realization,
)

export const ConnectableElementTemplateParameter = define(
  Uml.Types.ConnectableElementTemplateParameter,
  undefined,
  TemplateParameter,
)

export const Connector = define(Uml.Types.Connector, undefined, Feature)

export const ConnectorEnd = define(
  Uml.Types.ConnectorEnd,
  undefined,
  MultiplicityElement,
)

export const Port = define(Uml.Types.Port, undefined, Property)

export const Observation = defineAbstract(
  Uml.AbstractTypes.Observation,
  PackageableElement,
)

export const Behavior = defineAbstract(Uml.AbstractTypes.Behavior, Class)

export const Event = defineAbstract(Uml.AbstractTypes.Event, PackageableElement)

export const MessageEvent = defineAbstract(
  Uml.AbstractTypes.MessageEvent,
  Event,
)

export const Vertex = defineAbstract(
  Uml.AbstractTypes.Vertex,
  NamedElement,
  RedefinableElement,
)

export const ActivityEdge = defineAbstract(
  Uml.AbstractTypes.ActivityEdge,
  RedefinableElement,
)

export const ActivityGroup = defineAbstract(
  Uml.AbstractTypes.ActivityGroup,
  NamedElement,
)

export const ActivityNode = defineAbstract(
  Uml.AbstractTypes.ActivityNode,
  RedefinableElement,
)

export const ControlNode = defineAbstract(
  Uml.AbstractTypes.ControlNode,
  ActivityNode,
)

export const ExecutableNode = defineAbstract(
  Uml.AbstractTypes.ExecutableNode,
  ActivityNode,
)

export const FinalNode = defineAbstract(
  Uml.AbstractTypes.FinalNode,
  ControlNode,
)

export const ObjectNode = defineAbstract(
  Uml.AbstractTypes.ObjectNode,
  TypedElement,
  ActivityNode,
)

export const Action = defineAbstract(Uml.AbstractTypes.Action, ExecutableNode)

export const InvocationAction = defineAbstract(
  Uml.AbstractTypes.InvocationAction,
  Action,
)

export const CallAction = defineAbstract(
  Uml.AbstractTypes.CallAction,
  InvocationAction,
)

export const LinkAction = defineAbstract(Uml.AbstractTypes.LinkAction, Action)

export const Pin = defineAbstract(
  Uml.AbstractTypes.Pin,
  ObjectNode,
  MultiplicityElement,
)

export const StructuralFeatureAction = defineAbstract(
  Uml.AbstractTypes.StructuralFeatureAction,
  Action,
)

export const VariableAction = defineAbstract(
  Uml.AbstractTypes.VariableAction,
  Action,
)

export const WriteLinkAction = defineAbstract(
  Uml.AbstractTypes.WriteLinkAction,
  LinkAction,
)

export const WriteStructuralFeatureAction = defineAbstract(
  Uml.AbstractTypes.WriteStructuralFeatureAction,
  StructuralFeatureAction,
)

export const WriteVariableAction = defineAbstract(
  Uml.AbstractTypes.WriteVariableAction,
  VariableAction,
)

export const InteractionFragment = defineAbstract(
  Uml.AbstractTypes.InteractionFragment,
  NamedElement,
)

export const ExecutionSpecification = defineAbstract(
  Uml.AbstractTypes.ExecutionSpecification,
  InteractionFragment,
)

export const MessageEnd = defineAbstract(
  Uml.AbstractTypes.MessageEnd,
  NamedElement,
)
