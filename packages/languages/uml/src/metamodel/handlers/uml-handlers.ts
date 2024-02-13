import type { UmlAbstractType, UmlType } from '../uml'
import type { UmlMetamodelElement } from '../uml-metamodel'

import { AbstractionHandler } from './Abstraction'
import { AcceptCallActionHandler } from './AcceptCallAction'
import { AcceptEventActionHandler } from './AcceptEventAction'
import { ActionHandler } from './Action'
import { ActionExecutionSpecificationHandler } from './ActionExecutionSpecification'
import { ActionInputPinHandler } from './ActionInputPin'
import { ActivityHandler } from './Activity'
import { ActivityEdgeHandler } from './ActivityEdge'
import { ActivityFinalNodeHandler } from './ActivityFinalNode'
import { ActivityGroupHandler } from './ActivityGroup'
import { ActivityNodeHandler } from './ActivityNode'
import { ActivityParameterNodeHandler } from './ActivityParameterNode'
import { ActivityPartitionHandler } from './ActivityPartition'
import { ActorHandler } from './Actor'
import { AddStructuralFeatureValueActionHandler } from './AddStructuralFeatureValueAction'
import { AddVariableValueActionHandler } from './AddVariableValueAction'
import { AnyReceiveEventHandler } from './AnyReceiveEvent'
import { ArtifactHandler } from './Artifact'
import { AssociationHandler } from './Association'
import { AssociationClassHandler } from './AssociationClass'
import { BehaviorHandler } from './Behavior'
import { BehavioralFeatureHandler } from './BehavioralFeature'
import { BehavioredClassifierHandler } from './BehavioredClassifier'
import { BehaviorExecutionSpecificationHandler } from './BehaviorExecutionSpecification'
import { BroadcastSignalActionHandler } from './BroadcastSignalAction'
import { CallActionHandler } from './CallAction'
import { CallBehaviorActionHandler } from './CallBehaviorAction'
import { CallEventHandler } from './CallEvent'
import { CallOperationActionHandler } from './CallOperationAction'
import { CentralBufferNodeHandler } from './CentralBufferNode'
import { ChangeEventHandler } from './ChangeEvent'
import { ClassHandler } from './Class'
import { ClassifierHandler } from './Classifier'
import { ClassifierTemplateParameterHandler } from './ClassifierTemplateParameter'
import { ClauseHandler } from './Clause'
import { ClearAssociationActionHandler } from './ClearAssociationAction'
import { ClearStructuralFeatureActionHandler } from './ClearStructuralFeatureAction'
import { ClearVariableActionHandler } from './ClearVariableAction'
import { CollaborationHandler } from './Collaboration'
import { CollaborationUseHandler } from './CollaborationUse'
import { CombinedFragmentHandler } from './CombinedFragment'
import { CommentHandler } from './Comment'
import { CommunicationPathHandler } from './CommunicationPath'
import { ComponentHandler } from './Component'
import { ComponentRealizationHandler } from './ComponentRealization'
import { ConditionalNodeHandler } from './ConditionalNode'
import { ConnectableElementHandler } from './ConnectableElement'
import { ConnectableElementTemplateParameterHandler } from './ConnectableElementTemplateParameter'
import { ConnectionPointReferenceHandler } from './ConnectionPointReference'
import { ConnectorHandler } from './Connector'
import { ConnectorEndHandler } from './ConnectorEnd'
import { ConsiderIgnoreFragmentHandler } from './ConsiderIgnoreFragment'
import { ConstraintHandler } from './Constraint'
import { ContinuationHandler } from './Continuation'
import { ControlFlowHandler } from './ControlFlow'
import { ControlNodeHandler } from './ControlNode'
import { CreateLinkActionHandler } from './CreateLinkAction'
import { CreateLinkObjectActionHandler } from './CreateLinkObjectAction'
import { CreateObjectActionHandler } from './CreateObjectAction'
import { DataStoreNodeHandler } from './DataStoreNode'
import { DataTypeHandler } from './DataType'
import { DecisionNodeHandler } from './DecisionNode'
import { DependencyHandler } from './Dependency'
import { DeployedArtifactHandler } from './DeployedArtifact'
import { DeploymentHandler } from './Deployment'
import { DeploymentSpecificationHandler } from './DeploymentSpecification'
import { DeploymentTargetHandler } from './DeploymentTarget'
import { DestroyLinkActionHandler } from './DestroyLinkAction'
import { DestroyObjectActionHandler } from './DestroyObjectAction'
import { DestructionOccurrenceSpecificationHandler } from './DestructionOccurrenceSpecification'
import { DeviceHandler } from './Device'
import { DirectedRelationshipHandler } from './DirectedRelationship'
import { DurationHandler } from './Duration'
import { DurationConstraintHandler } from './DurationConstraint'
import { DurationIntervalHandler } from './DurationInterval'
import { DurationObservationHandler } from './DurationObservation'
import { ElementHandler } from './Element'
import { ElementImportHandler } from './ElementImport'
import { EncapsulatedClassifierHandler } from './EncapsulatedClassifier'
import { EnumerationHandler } from './Enumeration'
import { EnumerationLiteralHandler } from './EnumerationLiteral'
import { EventHandler } from './Event'
import { ExceptionHandlerHandler } from './ExceptionHandler'
import { ExecutableNodeHandler } from './ExecutableNode'
import { ExecutionEnvironmentHandler } from './ExecutionEnvironment'
import { ExecutionOccurrenceSpecificationHandler } from './ExecutionOccurrenceSpecification'
import { ExecutionSpecificationHandler } from './ExecutionSpecification'
import { ExpansionNodeHandler } from './ExpansionNode'
import { ExpansionRegionHandler } from './ExpansionRegion'
import { ExpressionHandler } from './Expression'
import { ExtendHandler } from './Extend'
import { ExtensionHandler } from './Extension'
import { ExtensionEndHandler } from './ExtensionEnd'
import { ExtensionPointHandler } from './ExtensionPoint'
import { FeatureHandler } from './Feature'
import { FinalNodeHandler } from './FinalNode'
import { FinalStateHandler } from './FinalState'
import { FlowFinalNodeHandler } from './FlowFinalNode'
import { ForkNodeHandler } from './ForkNode'
import { FunctionBehaviorHandler } from './FunctionBehavior'
import { GateHandler } from './Gate'
import { GeneralizationHandler } from './Generalization'
import { GeneralizationSetHandler } from './GeneralizationSet'
import { GeneralOrderingHandler } from './GeneralOrdering'
import { ImageHandler } from './Image'
import { IncludeHandler } from './Include'
import { InformationFlowHandler } from './InformationFlow'
import { InformationItemHandler } from './InformationItem'
import { InitialNodeHandler } from './InitialNode'
import { InputPinHandler } from './InputPin'
import { InstanceSpecificationHandler } from './InstanceSpecification'
import { InstanceValueHandler } from './InstanceValue'
import { InteractionHandler } from './Interaction'
import { InteractionConstraintHandler } from './InteractionConstraint'
import { InteractionFragmentHandler } from './InteractionFragment'
import { InteractionOperandHandler } from './InteractionOperand'
import { InteractionUseHandler } from './InteractionUse'
import { InterfaceHandler } from './Interface'
import { InterfaceRealizationHandler } from './InterfaceRealization'
import { InterruptibleActivityRegionHandler } from './InterruptibleActivityRegion'
import { IntervalHandler } from './Interval'
import { IntervalConstraintHandler } from './IntervalConstraint'
import { InvocationActionHandler } from './InvocationAction'
import { JoinNodeHandler } from './JoinNode'
import { LifelineHandler } from './Lifeline'
import { LinkActionHandler } from './LinkAction'
import { LinkEndCreationDataHandler } from './LinkEndCreationData'
import { LinkEndDataHandler } from './LinkEndData'
import { LinkEndDestructionDataHandler } from './LinkEndDestructionData'
import { LiteralBooleanHandler } from './LiteralBoolean'
import { LiteralIntegerHandler } from './LiteralInteger'
import { LiteralNullHandler } from './LiteralNull'
import { LiteralRealHandler } from './LiteralReal'
import { LiteralSpecificationHandler } from './LiteralSpecification'
import { LiteralStringHandler } from './LiteralString'
import { LiteralUnlimitedNaturalHandler } from './LiteralUnlimitedNatural'
import { LoopNodeHandler } from './LoopNode'
import { ManifestationHandler } from './Manifestation'
import { MergeNodeHandler } from './MergeNode'
import { MessageHandler } from './Message'
import { MessageEndHandler } from './MessageEnd'
import { MessageEventHandler } from './MessageEvent'
import { MessageOccurrenceSpecificationHandler } from './MessageOccurrenceSpecification'
import { ModelHandler } from './Model'
import { MultiplicityElementHandler } from './MultiplicityElement'
import { NamedElementHandler } from './NamedElement'
import { NamespaceHandler } from './Namespace'
import { NodeHandler } from './Node'
import { ObjectFlowHandler } from './ObjectFlow'
import { ObjectNodeHandler } from './ObjectNode'
import { ObservationHandler } from './Observation'
import { OccurrenceSpecificationHandler } from './OccurrenceSpecification'
import { OpaqueActionHandler } from './OpaqueAction'
import { OpaqueBehaviorHandler } from './OpaqueBehavior'
import { OpaqueExpressionHandler } from './OpaqueExpression'
import { OperationHandler } from './Operation'
import { OperationTemplateParameterHandler } from './OperationTemplateParameter'
import { OutputPinHandler } from './OutputPin'
import { PackageHandler } from './Package'
import { PackageableElementHandler } from './PackageableElement'
import { PackageImportHandler } from './PackageImport'
import { PackageMergeHandler } from './PackageMerge'
import { ParameterHandler } from './Parameter'
import { ParameterableElementHandler } from './ParameterableElement'
import { ParameterSetHandler } from './ParameterSet'
import { PartDecompositionHandler } from './PartDecomposition'
import { PinHandler } from './Pin'
import { PortHandler } from './Port'
import { PrimitiveTypeHandler } from './PrimitiveType'
import { ProfileHandler } from './Profile'
import { ProfileApplicationHandler } from './ProfileApplication'
import { PropertyHandler } from './Property'
import { ProtocolConformanceHandler } from './ProtocolConformance'
import { ProtocolStateMachineHandler } from './ProtocolStateMachine'
import { ProtocolTransitionHandler } from './ProtocolTransition'
import { PseudostateHandler } from './Pseudostate'
import { QualifierValueHandler } from './QualifierValue'
import { RaiseExceptionActionHandler } from './RaiseExceptionAction'
import { ReadExtentActionHandler } from './ReadExtentAction'
import { ReadIsClassifiedObjectActionHandler } from './ReadIsClassifiedObjectAction'
import { ReadLinkActionHandler } from './ReadLinkAction'
import { ReadLinkObjectEndActionHandler } from './ReadLinkObjectEndAction'
import { ReadLinkObjectEndQualifierActionHandler } from './ReadLinkObjectEndQualifierAction'
import { ReadSelfActionHandler } from './ReadSelfAction'
import { ReadStructuralFeatureActionHandler } from './ReadStructuralFeatureAction'
import { ReadVariableActionHandler } from './ReadVariableAction'
import { RealizationHandler } from './Realization'
import { ReceptionHandler } from './Reception'
import { ReclassifyObjectActionHandler } from './ReclassifyObjectAction'
import { RedefinableElementHandler } from './RedefinableElement'
import { RedefinableTemplateSignatureHandler } from './RedefinableTemplateSignature'
import { ReduceActionHandler } from './ReduceAction'
import { RegionHandler } from './Region'
import { RelationshipHandler } from './Relationship'
import { RemoveStructuralFeatureValueActionHandler } from './RemoveStructuralFeatureValueAction'
import { RemoveVariableValueActionHandler } from './RemoveVariableValueAction'
import { ReplyActionHandler } from './ReplyAction'
import { SendObjectActionHandler } from './SendObjectAction'
import { SendSignalActionHandler } from './SendSignalAction'
import { SequenceNodeHandler } from './SequenceNode'
import { SignalHandler } from './Signal'
import { SignalEventHandler } from './SignalEvent'
import { SlotHandler } from './Slot'
import { StartClassifierBehaviorActionHandler } from './StartClassifierBehaviorAction'
import { StartObjectBehaviorActionHandler } from './StartObjectBehaviorAction'
import { StateHandler } from './State'
import { StateInvariantHandler } from './StateInvariant'
import { StateMachineHandler } from './StateMachine'
import { StereotypeHandler } from './Stereotype'
import { StringExpressionHandler } from './StringExpression'
import { StructuralFeatureHandler } from './StructuralFeature'
import { StructuralFeatureActionHandler } from './StructuralFeatureAction'
import { StructuredActivityNodeHandler } from './StructuredActivityNode'
import { StructuredClassifierHandler } from './StructuredClassifier'
import { SubstitutionHandler } from './Substitution'
import { TemplateableElementHandler } from './TemplateableElement'
import { TemplateBindingHandler } from './TemplateBinding'
import { TemplateParameterHandler } from './TemplateParameter'
import { TemplateParameterSubstitutionHandler } from './TemplateParameterSubstitution'
import { TemplateSignatureHandler } from './TemplateSignature'
import { TestIdentityActionHandler } from './TestIdentityAction'
import { TimeConstraintHandler } from './TimeConstraint'
import { TimeEventHandler } from './TimeEvent'
import { TimeExpressionHandler } from './TimeExpression'
import { TimeIntervalHandler } from './TimeInterval'
import { TimeObservationHandler } from './TimeObservation'
import { TransitionHandler } from './Transition'
import { TriggerHandler } from './Trigger'
import { TypeHandler } from './Type'
import { TypedElementHandler } from './TypedElement'
import { UnmarshallActionHandler } from './UnmarshallAction'
import { UsageHandler } from './Usage'
import { UseCaseHandler } from './UseCase'
import { ValuePinHandler } from './ValuePin'
import { ValueSpecificationHandler } from './ValueSpecification'
import { ValueSpecificationActionHandler } from './ValueSpecificationAction'
import { VariableHandler } from './Variable'
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
  AcceptCallActionHandler,
  AcceptEventActionHandler,
  ActionExecutionSpecificationHandler,
  ActionHandler,
  ActionInputPinHandler,
  ActivityEdgeHandler,
  ActivityFinalNodeHandler,
  ActivityGroupHandler,
  ActivityHandler,
  ActivityNodeHandler,
  ActivityParameterNodeHandler,
  ActivityPartitionHandler,
  ActorHandler,
  AddStructuralFeatureValueActionHandler,
  AddVariableValueActionHandler,
  AnyReceiveEventHandler,
  ArtifactHandler,
  AssociationClassHandler,
  AssociationHandler,
  BehavioralFeatureHandler,
  BehavioredClassifierHandler,
  BehaviorExecutionSpecificationHandler,
  BehaviorHandler,
  BroadcastSignalActionHandler,
  CallActionHandler,
  CallBehaviorActionHandler,
  CallEventHandler,
  CallOperationActionHandler,
  ChangeEventHandler,
  CentralBufferNodeHandler,
  ClassHandler,
  ClassifierHandler,
  ClassifierTemplateParameterHandler,
  ClauseHandler,
  ClearAssociationActionHandler,
  ClearStructuralFeatureActionHandler,
  ClearVariableActionHandler,
  CollaborationHandler,
  CollaborationUseHandler,
  CombinedFragmentHandler,
  CommentHandler,
  CommunicationPathHandler,
  ComponentHandler,
  ComponentRealizationHandler,
  ConditionalNodeHandler,
  ConnectableElementHandler,
  ConnectableElementTemplateParameterHandler,
  ConnectionPointReferenceHandler,
  ConnectorEndHandler,
  ConnectorHandler,
  ConsiderIgnoreFragmentHandler,
  ConstraintHandler,
  ContinuationHandler,
  ControlFlowHandler,
  ControlNodeHandler,
  CreateLinkActionHandler,
  CreateLinkObjectActionHandler,
  CreateObjectActionHandler,
  DataStoreNodeHandler,
  DataTypeHandler,
  DecisionNodeHandler,
  DependencyHandler,
  DeployedArtifactHandler,
  DeploymentHandler,
  DeploymentSpecificationHandler,
  DeploymentTargetHandler,
  DestroyLinkActionHandler,
  DestroyObjectActionHandler,
  DestructionOccurrenceSpecificationHandler,
  DeviceHandler,
  DirectedRelationshipHandler,
  DurationConstraintHandler,
  DurationHandler,
  DurationIntervalHandler,
  DurationObservationHandler,
  ElementHandler,
  ElementImportHandler,
  EncapsulatedClassifierHandler,
  EnumerationHandler,
  EnumerationLiteralHandler,
  EventHandler,
  ExceptionHandlerHandler,
  ExecutableNodeHandler,
  ExecutionEnvironmentHandler,
  ExecutionOccurrenceSpecificationHandler,
  ExecutionSpecificationHandler,
  ExpansionNodeHandler,
  ExpansionRegionHandler,
  ExpressionHandler,
  ExtendHandler,
  ExtensionEndHandler,
  ExtensionHandler,
  ExtensionPointHandler,
  FeatureHandler,
  FinalNodeHandler,
  FinalStateHandler,
  FlowFinalNodeHandler,
  ForkNodeHandler,
  FunctionBehaviorHandler,
  GateHandler,
  GeneralizationHandler,
  GeneralizationSetHandler,
  GeneralOrderingHandler,
  ImageHandler,
  IncludeHandler,
  InformationFlowHandler,
  InformationItemHandler,
  InitialNodeHandler,
  InputPinHandler,
  InstanceSpecificationHandler,
  InstanceValueHandler,
  InteractionConstraintHandler,
  InteractionFragmentHandler,
  InteractionHandler,
  InteractionOperandHandler,
  InteractionUseHandler,
  InterfaceHandler,
  InterfaceRealizationHandler,
  InterruptibleActivityRegionHandler,
  IntervalConstraintHandler,
  IntervalHandler,
  InvocationActionHandler,
  JoinNodeHandler,
  LifelineHandler,
  LinkActionHandler,
  LinkEndCreationDataHandler,
  LinkEndDataHandler,
  LinkEndDestructionDataHandler,
  LiteralBooleanHandler,
  LiteralIntegerHandler,
  LiteralNullHandler,
  LiteralRealHandler,
  LiteralSpecificationHandler,
  LiteralStringHandler,
  LiteralUnlimitedNaturalHandler,
  LoopNodeHandler,
  ManifestationHandler,
  MergeNodeHandler,
  MessageEndHandler,
  MessageEventHandler,
  MessageHandler,
  MessageOccurrenceSpecificationHandler,
  ModelHandler,
  MultiplicityElementHandler,
  NamedElementHandler,
  NamespaceHandler,
  NodeHandler,
  ObjectFlowHandler,
  ObjectNodeHandler,
  ObservationHandler,
  OccurrenceSpecificationHandler,
  OpaqueActionHandler,
  OpaqueBehaviorHandler,
  OpaqueExpressionHandler,
  OperationHandler,
  OperationTemplateParameterHandler,
  OutputPinHandler,
  PackageableElementHandler,
  PackageHandler,
  PackageImportHandler,
  PackageMergeHandler,
  ParameterableElementHandler,
  ParameterHandler,
  ParameterSetHandler,
  PartDecompositionHandler,
  PinHandler,
  PortHandler,
  PrimitiveTypeHandler,
  ProfileHandler,
  ProfileApplicationHandler,
  PropertyHandler,
  ProtocolConformanceHandler,
  ProtocolStateMachineHandler,
  ProtocolTransitionHandler,
  PseudostateHandler,
  QualifierValueHandler,
  RaiseExceptionActionHandler,
  ReadExtentActionHandler,
  ReadIsClassifiedObjectActionHandler,
  ReadLinkActionHandler,
  ReadLinkObjectEndActionHandler,
  ReadLinkObjectEndQualifierActionHandler,
  ReadSelfActionHandler,
  ReadStructuralFeatureActionHandler,
  ReadVariableActionHandler,
  RealizationHandler,
  ReceptionHandler,
  ReclassifyObjectActionHandler,
  RedefinableElementHandler,
  RedefinableTemplateSignatureHandler,
  ReduceActionHandler,
  RegionHandler,
  RelationshipHandler,
  RemoveStructuralFeatureValueActionHandler,
  RemoveVariableValueActionHandler,
  ReplyActionHandler,
  SendObjectActionHandler,
  SendSignalActionHandler,
  SequenceNodeHandler,
  SignalEventHandler,
  SignalHandler,
  SlotHandler,
  StartClassifierBehaviorActionHandler,
  StartObjectBehaviorActionHandler,
  StateHandler,
  StateInvariantHandler,
  StateMachineHandler,
  StereotypeHandler,
  StringExpressionHandler,
  StructuralFeatureActionHandler,
  StructuralFeatureHandler,
  StructuredActivityNodeHandler,
  StructuredClassifierHandler,
  SubstitutionHandler,
  TemplateableElementHandler,
  TemplateBindingHandler,
  TemplateParameterHandler,
  TemplateParameterSubstitutionHandler,
  TemplateSignatureHandler,
  TestIdentityActionHandler,
  TimeConstraintHandler,
  TimeEventHandler,
  TimeExpressionHandler,
  TimeIntervalHandler,
  TimeObservationHandler,
  TransitionHandler,
  TriggerHandler,
  TypedElementHandler,
  TypeHandler,
  UnmarshallActionHandler,
  UsageHandler,
  UseCaseHandler,
  ValuePinHandler,
  ValueSpecificationHandler,
  ValueSpecificationActionHandler,
  VariableActionHandler,
  VariableHandler,
  VertexHandler,
  WriteLinkActionHandler,
  WriteStructuralFeatureActionHandler,
  WriteVariableActionHandler,
}
