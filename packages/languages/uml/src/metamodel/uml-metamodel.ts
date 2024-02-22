import type { GraphNode } from '@cm2ml/ir'
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

export function requireAssignability(node: GraphNode, type: UmlMetamodelElement) {
  if (!type.isAssignable(node)) {
    throw new Error(`Node is not assignable to type: ${type.name}`)
  }
}

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
  MultiplicityElement,
  ConnectableElement,
)

export const ParameterSet = define(
  Uml.Types.ParameterSet,
  Uml.Tags.ownedParameterSet,
  NamedElement,
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

export const Comment = define(Uml.Types.Comment, Uml.Tags.ownedComment, Element)

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
  Uml.Tags.templateBinding,
  DirectedRelationship,
)

export const TemplateParameter = define(
  Uml.Types.TemplateParameter,
  undefined,
  Element,
)

export const TemplateParameterSubstitution = define(
  Uml.Types.TemplateParameterSubstitution,
  Uml.Tags.parameterSubstitution,
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
  Uml.Tags.importedPackage,
  PackageableElement,
  TemplateableElement,
  Namespace,
)

export const Profile = define(Uml.Types.Profile, Uml.Tags.appliedProfile, Package)

export const ProfileApplication = define(
  Uml.Types.ProfileApplication,
  Uml.Tags.profileApplication,
  DirectedRelationship,
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

export const LiteralBoolean = define(
  Uml.Types.LiteralBoolean,
  undefined,
  LiteralSpecification,
)

export const LiteralInteger = define(
  Uml.Types.LiteralInteger,
  undefined,
  LiteralSpecification,
)

export const LiteralNull = define(
  Uml.Types.LiteralNull,
  undefined,
  LiteralSpecification,
)

export const LiteralReal = define(
  Uml.Types.LiteralReal,
  undefined,
  LiteralSpecification,
)

export const LiteralString = define(
  Uml.Types.LiteralString,
  undefined,
  LiteralSpecification,
)

export const LiteralUnlimitedNatural = define(
  Uml.Types.LiteralUnlimitedNatural,
  undefined,
  LiteralSpecification,
)

export const OpaqueExpression = define(
  Uml.Types.OpaqueExpression,
  undefined,
  ValueSpecification,
)

// TODO: Validate generalization
export const Expression = define(
  Uml.Types.Expression,
  undefined,
  ValueSpecification,
)

export const StringExpression = define(
  Uml.Types.StringExpression,
  Uml.Tags.nameExpression,
  TemplateableElement,
  Expression,
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

export const InstanceValue = define(
  Uml.Types.InstanceValue,
  undefined,
  ValueSpecification,
)

export const Enumeration = define(Uml.Types.Enumeration, undefined, DataType)

export const EnumerationLiteral = define(
  Uml.Types.EnumerationLiteral,
  Uml.Tags.ownedLiteral,
  InstanceSpecification,
)

export const Interface = define(Uml.Types.Interface, Uml.Tags.contract, Classifier)

export const Substitution = define(
  Uml.Types.Substitution,
  Uml.Tags.substitution,
  Realization,
)

export const Association = define(
  Uml.Types.Association,
  Uml.Tags.association,
  Relationship,
  Classifier,
)

export const AssociationClass = define(
  Uml.Types.AssociationClass,
  undefined,
  Class,
  Association,
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

export const Connector = define(Uml.Types.Connector, Uml.Tags.ownedConnector, Feature)

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

export const Duration = define(
  Uml.Types.Duration,
  undefined,
  ValueSpecification,
)

export const Interval = define(
  Uml.Types.Interval,
  undefined,
  ValueSpecification,
)

export const IntervalConstraint = define(
  Uml.Types.IntervalConstraint,
  undefined,
  Constraint,
)

export const DurationConstraint = define(
  Uml.Types.DurationConstraint,
  undefined,
  IntervalConstraint,
)

export const DurationInterval = define(
  Uml.Types.DurationInterval,
  undefined,
  Interval,
)

export const DurationObservation = define(
  Uml.Types.DurationObservation,
  undefined,
  Observation,
)

export const TimeConstraint = define(
  Uml.Types.TimeConstraint,
  undefined,
  IntervalConstraint,
)

export const TimeExpression = define(
  Uml.Types.TimeExpression,
  undefined,
  ValueSpecification,
)

export const TimeInterval = define(Uml.Types.TimeInterval, undefined, Interval)

export const TimeObservation = define(
  Uml.Types.TimeObservation,
  undefined,
  Observation,
)

export const ClassifierTemplateParameter = define(
  Uml.Types.ClassifierTemplateParameter,
  undefined,
  TemplateParameter,
)

export const GeneralizationSet = define(
  Uml.Types.GeneralizationSet,
  undefined,
  PackageableElement,
)

export const OperationTemplateParameter = define(
  Uml.Types.OperationTemplateParameter,
  undefined,
  TemplateParameter,
)

export const RedefinableTemplateSignature = define(
  Uml.Types.RedefinableTemplateSignature,
  undefined,
  RedefinableElement,
  TemplateSignature,
)

export const Slot = define(Uml.Types.Slot, Uml.Tags.slot, Element)

export const Reception = define(
  Uml.Types.Reception,
  undefined,
  BehavioralFeature,
)

export const Signal = define(Uml.Types.Signal, undefined, Classifier)

export const Extension = define(Uml.Types.Extension, undefined, Association)

export const ExtensionEnd = define(Uml.Types.ExtensionEnd, undefined, Property)

export const Image = define(Uml.Types.Image, Uml.Tags.icon, Element)

export const Stereotype = define(Uml.Types.Stereotype, undefined, Class)

export const AnyReceiveEvent = define(
  Uml.Types.AnyReceiveEvent,
  undefined,
  MessageEvent,
)

export const CallEvent = define(Uml.Types.CallEvent, undefined, MessageEvent)

export const ChangeEvent = define(Uml.Types.ChangeEvent, undefined, Event)

export const OpaqueBehavior = define(
  Uml.Types.OpaqueBehavior,
  undefined,
  Behavior,
)

export const FunctionBehavior = define(
  Uml.Types.FunctionBehavior,
  undefined,
  OpaqueBehavior,
)

export const SignalEvent = define(
  Uml.Types.SignalEvent,
  undefined,
  MessageEvent,
)

export const TimeEvent = define(Uml.Types.TimeEvent, undefined, Event)

export const Trigger = define(Uml.Types.Trigger, Uml.Tags.trigger, NamedElement)

export const ConnectionPointReference = define(
  Uml.Types.ConnectionPointReference,
  undefined,
  Vertex,
)

export const State = define(Uml.Types.State, undefined, Namespace, Vertex)

export const FinalState = define(Uml.Types.FinalState, undefined, State)

export const ProtocolConformance = define(
  Uml.Types.ProtocolConformance,
  undefined,
  DirectedRelationship,
)

export const StateMachine = define(Uml.Types.StateMachine, undefined, Behavior)

export const ProtocolStateMachine = define(
  Uml.Types.ProtocolStateMachine,
  undefined,
  StateMachine,
)

export const Transition = define(
  Uml.Types.Transition,
  Uml.Tags.transition,
  Namespace,
  RedefinableElement,
)

export const ProtocolTransition = define(
  Uml.Types.ProtocolTransition,
  undefined,
  Transition,
)

export const Pseudostate = define(Uml.Types.Pseudostate, undefined, Vertex)

export const Region = define(
  Uml.Types.Region,
  Uml.Tags.region,
  Namespace,
  RedefinableElement,
)

export const Activity = define(Uml.Types.Activity, undefined, Behavior)

export const ActivityFinalNode = define(
  Uml.Types.ActivityFinalNode,
  undefined,
  FinalNode,
)

export const ActivityParameterNode = define(
  Uml.Types.ActivityParameterNode,
  undefined,
  ObjectNode,
)

export const ActivityPartition = define(
  Uml.Types.ActivityPartition,
  undefined,
  ActivityGroup,
)

export const CentralBufferNode = define(
  Uml.Types.CentralBufferNode,
  undefined,
  ObjectNode,
)

export const ControlFlow = define(
  Uml.Types.ControlFlow,
  undefined,
  ActivityEdge,
)

export const DataStoreNode = define(
  Uml.Types.DataStoreNode,
  undefined,
  CentralBufferNode,
)

export const DecisionNode = define(
  Uml.Types.DecisionNode,
  undefined,
  ControlNode,
)

export const ExceptionHandler = define(
  Uml.Types.ExceptionHandler,
  undefined,
  Element,
)

export const FlowFinalNode = define(
  Uml.Types.FlowFinalNode,
  undefined,
  FinalNode,
)

export const ForkNode = define(Uml.Types.ForkNode, undefined, ControlNode)

export const InitialNode = define(Uml.Types.InitialNode, undefined, ControlNode)

export const InterruptibleActivityRegion = define(
  Uml.Types.InterruptibleActivityRegion,
  undefined,
  ActivityGroup,
)

export const JoinNode = define(Uml.Types.JoinNode, undefined, ControlNode)

export const MergeNode = define(Uml.Types.MergeNode, undefined, ControlNode)

export const ObjectFlow = define(Uml.Types.ObjectFlow, undefined, ActivityEdge)

export const Variable = define(
  Uml.Types.Variable,
  undefined,
  ConnectableElement,
  MultiplicityElement,
)

export const AcceptEventAction = define(
  Uml.Types.AcceptEventAction,
  undefined,
  Action,
)

export const AcceptCallAction = define(
  Uml.Types.AcceptCallAction,
  undefined,
  AcceptEventAction,
)

export const InputPin = define(Uml.Types.InputPin, Uml.Tags.target, Pin)

export const ActionInputPin = define(
  Uml.Types.ActionInputPin,
  undefined,
  InputPin,
)

export const AddStructuralFeatureValueAction = define(
  Uml.Types.AddStructuralFeatureValueAction,
  undefined,
  WriteStructuralFeatureAction,
)

export const AddVariableValueAction = define(
  Uml.Types.AddVariableValueAction,
  undefined,
  WriteVariableAction,
)

export const BroadcastSignalAction = define(
  Uml.Types.BroadcastSignalAction,
  undefined,
  InvocationAction,
)

export const CallBehaviorAction = define(
  Uml.Types.CallBehaviorAction,
  undefined,
  CallAction,
)

export const CallOperationAction = define(
  Uml.Types.CallOperationAction,
  undefined,
  CallAction,
)

export const Clause = define(Uml.Types.Clause, undefined, Element)

export const ClearAssociationAction = define(
  Uml.Types.ClearAssociationAction,
  undefined,
  Action,
)

export const ClearStructuralFeatureAction = define(
  Uml.Types.ClearStructuralFeatureAction,
  undefined,
  StructuralFeatureAction,
)

export const ClearVariableAction = define(
  Uml.Types.ClearVariableAction,
  undefined,
  VariableAction,
)

export const StructuredActivityNode = define(
  Uml.Types.StructuredActivityNode,
  undefined,
  Namespace,
  ActivityGroup,
  Action,
)

export const ConditionalNode = define(
  Uml.Types.ConditionalNode,
  undefined,
  StructuredActivityNode,
)

export const CreateLinkAction = define(
  Uml.Types.CreateLinkAction,
  undefined,
  WriteLinkAction,
)

export const CreateLinkObjectAction = define(
  Uml.Types.CreateLinkObjectAction,
  undefined,
  CreateLinkAction,
)

export const CreateObjectAction = define(
  Uml.Types.CreateObjectAction,
  undefined,
  Action,
)

export const DestroyLinkAction = define(
  Uml.Types.DestroyLinkAction,
  undefined,
  WriteLinkAction,
)

export const DestroyObjectAction = define(
  Uml.Types.DestroyObjectAction,
  undefined,
  Action,
)

export const ExpansionNode = define(
  Uml.Types.ExpansionNode,
  undefined,
  ObjectNode,
)

export const ExpansionRegion = define(
  Uml.Types.ExpansionRegion,
  undefined,
  StructuredActivityNode,
)

export const LinkEndData = define(Uml.Types.LinkEndData, undefined, Element)

export const LinkEndCreationData = define(
  Uml.Types.LinkEndCreationData,
  undefined,
  LinkEndData,
)

export const LinkEndDestructionData = define(
  Uml.Types.LinkEndDestructionData,
  undefined,
  LinkEndData,
)

export const LoopNode = define(
  Uml.Types.LoopNode,
  undefined,
  StructuredActivityNode,
)

export const OpaqueAction = define(Uml.Types.OpaqueAction, undefined, Action)

export const OutputPin = define(Uml.Types.OutputPin, undefined, Pin)

export const QualifierValue = define(
  Uml.Types.QualifierValue,
  undefined,
  Element,
)

export const RaiseExceptionAction = define(
  Uml.Types.RaiseExceptionAction,
  undefined,
  Action,
)

export const ReadExtentAction = define(
  Uml.Types.ReadExtentAction,
  undefined,
  Action,
)

export const ReadIsClassifiedObjectAction = define(
  Uml.Types.ReadIsClassifiedObjectAction,
  undefined,
  Action,
)

export const ReadLinkAction = define(
  Uml.Types.ReadLinkAction,
  undefined,
  LinkAction,
)

export const ReadLinkObjectEndAction = define(
  Uml.Types.ReadLinkObjectEndAction,
  undefined,
  Action,
)

export const ReadLinkObjectEndQualifierAction = define(
  Uml.Types.ReadLinkObjectEndQualifierAction,
  undefined,
  Action,
)

export const ReadSelfAction = define(
  Uml.Types.ReadSelfAction,
  undefined,
  Action,
)

export const ReadStructuralFeatureAction = define(
  Uml.Types.ReadStructuralFeatureAction,
  undefined,
  StructuralFeatureAction,
)

export const ReadVariableAction = define(
  Uml.Types.ReadVariableAction,
  undefined,
  VariableAction,
)

export const ReclassifyObjectAction = define(
  Uml.Types.ReclassifyObjectAction,
  undefined,
  Action,
)

export const ReduceAction = define(Uml.Types.ReduceAction, undefined, Action)

export const RemoveStructuralFeatureValueAction = define(
  Uml.Types.RemoveStructuralFeatureValueAction,
  undefined,
  WriteStructuralFeatureAction,
)

export const RemoveVariableValueAction = define(
  Uml.Types.RemoveVariableValueAction,
  undefined,
  WriteVariableAction,
)

export const ReplyAction = define(Uml.Types.ReplyAction, undefined, Action)

export const SendObjectAction = define(
  Uml.Types.SendObjectAction,
  undefined,
  InvocationAction,
)

export const SendSignalAction = define(
  Uml.Types.SendSignalAction,
  undefined,
  InvocationAction,
)

export const SequenceNode = define(
  Uml.Types.SequenceNode,
  undefined,
  StructuredActivityNode,
)

export const StartClassifierBehaviorAction = define(
  Uml.Types.StartClassifierBehaviorAction,
  undefined,
  Action,
)

export const StartObjectBehaviorAction = define(
  Uml.Types.StartObjectBehaviorAction,
  undefined,
  CallAction,
)

export const TestIdentityAction = define(
  Uml.Types.TestIdentityAction,
  undefined,
  Action,
)

export const UnmarshallAction = define(
  Uml.Types.UnmarshallAction,
  undefined,
  Action,
)

export const ValuePin = define(Uml.Types.ValuePin, undefined, InputPin)

export const ValueSpecificationAction = define(
  Uml.Types.ValueSpecificationAction,
  undefined,
  Action,
)

export const ActionExecutionSpecification = define(
  Uml.Types.ActionExecutionSpecification,
  undefined,
  ExecutionSpecification,
)

export const BehaviorExecutionSpecification = define(
  Uml.Types.BehaviorExecutionSpecification,
  undefined,
  ExecutionSpecification,
)

export const CombinedFragment = define(
  Uml.Types.CombinedFragment,
  undefined,
  InteractionFragment,
)

export const ConsiderIgnoreFragment = define(
  Uml.Types.ConsiderIgnoreFragment,
  undefined,
  CombinedFragment,
)

export const Continuation = define(
  Uml.Types.Continuation,
  undefined,
  InteractionFragment,
)

export const OccurrenceSpecification = define(
  Uml.Types.OccurrenceSpecification,
  undefined,
  InteractionFragment,
)

export const MessageOccurrenceSpecification = define(
  Uml.Types.MessageOccurrenceSpecification,
  undefined,
  MessageEnd,
  OccurrenceSpecification,
)

export const DestructionOccurrenceSpecification = define(
  Uml.Types.DestructionOccurrenceSpecification,
  undefined,
  MessageOccurrenceSpecification,
)

export const ExecutionOccurrenceSpecification = define(
  Uml.Types.ExecutionOccurrenceSpecification,
  undefined,
  OccurrenceSpecification,
)

export const Gate = define(Uml.Types.Gate, undefined, MessageEnd)

export const GeneralOrdering = define(
  Uml.Types.GeneralOrdering,
  undefined,
  NamedElement,
)

export const Interaction = define(
  Uml.Types.Interaction,
  undefined,
  InteractionFragment,
  Behavior,
)

export const InteractionConstraint = define(
  Uml.Types.InteractionConstraint,
  undefined,
  Constraint,
)

export const InteractionOperand = define(
  Uml.Types.InteractionOperand,
  undefined,
  InteractionFragment,
  Namespace,
)

export const InteractionUse = define(
  Uml.Types.InteractionUse,
  undefined,
  InteractionFragment,
)

export const Lifeline = define(Uml.Types.Lifeline, Uml.Tags.lifeline, NamedElement)

export const Message = define(Uml.Types.Message, undefined, NamedElement)

export const PartDecomposition = define(
  Uml.Types.PartDecomposition,
  undefined,
  InteractionUse,
)

export const StateInvariant = define(
  Uml.Types.StateInvariant,
  undefined,
  InteractionFragment,
)

export const Actor = define(Uml.Types.Actor, undefined, BehavioredClassifier)

export const Extend = define(
  Uml.Types.Extend,
  undefined,
  NamedElement,
  DirectedRelationship,
)

export const ExtensionPoint = define(
  Uml.Types.ExtensionPoint,
  Uml.Tags.extensionPoint,
  RedefinableElement,
)

export const Include = define(
  Uml.Types.Include,
  Uml.Tags.include,
  DirectedRelationship,
  NamedElement,
)

export const UseCase = define(
  Uml.Types.UseCase,
  undefined,
  BehavioredClassifier,
)

export const Artifact = define(
  Uml.Types.Artifact,
  undefined,
  Classifier,
  DeployedArtifact,
)

export const CommunicationPath = define(
  Uml.Types.CommunicationPath,
  undefined,
  Association,
)

export const Deployment = define(Uml.Types.Deployment, Uml.Tags.deployment, Dependency)

export const DeploymentSpecification = define(
  Uml.Types.DeploymentSpecification,
  undefined,
  Artifact,
)

export const Node = define(Uml.Types.Node, undefined, Class, DeploymentTarget)

export const Device = define(Uml.Types.Device, undefined, Node)

export const ExecutionEnvironment = define(
  Uml.Types.ExecutionEnvironment,
  undefined,
  Node,
)

export const Manifestation = define(
  Uml.Types.Manifestation,
  undefined,
  Abstraction,
)

export const InformationFlow = define(
  Uml.Types.InformationFlow,
  undefined,
  DirectedRelationship,
  PackageableElement,
)

export const InformationItem = define(
  Uml.Types.InformationItem,
  undefined,
  Classifier,
)
