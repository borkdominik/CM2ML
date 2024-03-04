import type { Attributable, GraphEdge, GraphNode } from '@cm2ml/ir'
import type { Callback } from '@cm2ml/metamodel'
import { transformNodeToEdge } from '@cm2ml/metamodel'
import { parseNamespace } from '@cm2ml/utils'

const Attributes = {
  aggregation: 'aggregation',
  alias: 'alias',
  allowSubstitutable: 'allowSubstitutable',
  body: 'body',
  concurrency: 'concurrency',
  content: 'content',
  default: 'default',
  deploymentLocation: 'deploymentLocation',
  direction: 'direction',
  effect: 'effect',
  executionLocation: 'executionLocation',
  fileName: 'fileName',
  firstEvent: 'firstEvent',
  format: 'format',
  general: 'general',
  interactionOperator: 'interactionOperator',
  isAbstract: 'isAbstract',
  isActive: 'isActive',
  isAssured: 'isAssured',
  isBehavior: 'isBehavior',
  isCombineDuplicate: 'isCombineDuplicate',
  isComposite: 'isComposite',
  isConjugated: 'isConjugated',
  isControl: 'isControl',
  isControlType: 'isControlType',
  isCovering: 'isCovering',
  isDerived: 'isDerived',
  isDerivedUnion: 'isDerivedUnion',
  isDestroyDuplicates: 'isDestroyDuplicates',
  isDestroyLinks: 'isDestroyLinks',
  isDestroyOwnedObjects: 'isDestroyOwnedObjects',
  isDeterminate: 'isDeterminate',
  isDimension: 'isDimension',
  isDirect: 'isDirect',
  isDisjoint: 'isDisjoint',
  isExternal: 'isExternal',
  isException: 'isException',
  isFinalSpecialization: 'isFinalSpecialization',
  isID: 'isID',
  isIndirectlyInstantiated: 'isIndirectlyInstantiated',
  isLeaf: 'isLeaf',
  isLocallyReentrant: 'isLocallyReentrant',
  isMulticast: 'isMulticast',
  isMultireceive: 'isMultireceive',
  isOrdered: 'isOrdered',
  isOrthogonal: 'isOrthogonal',
  isQuery: 'isQuery',
  isReadOnly: 'isReadOnly',
  isReentrant: 'isReentrant',
  isRelative: 'isRelative',
  isRemoveDuplicates: 'isRemoveDuplicates',
  isReplaceAll: 'isReplaceAll',
  isRequired: 'isRequired',
  isService: 'isService',
  isSimple: 'isSimple',
  isSingleExecution: 'isSingleExecution',
  isStatic: 'isStatic',
  isStream: 'isStream',
  isStrict: 'isStrict',
  isSubmachineState: 'isSubmachineState',
  isSubstitutable: 'isSubstitutable',
  isSynchronous: 'isSynchronous',
  isTestedFirst: 'isTestedFirst',
  isUnique: 'isUnique',
  isUnmarshall: 'isUnmarshall',
  kind: 'kind',
  language: 'language',
  location: 'location',
  lower: 'lower',
  messageKind: 'messageKind',
  messageSort: 'messageSort',
  mode: 'mode',
  mustIsolate: 'mustIsolate',
  name: 'name',
  ordering: 'ordering',
  setting: 'setting',
  symbol: 'symbol',
  upper: 'upper',
  URI: 'URI',
  value: 'value',
  viewpoint: 'viewpoint',
  visibility: 'visibility',
  'xmi:id': 'xmi:id',
  'xmi:type': 'xmi:type',
  'xsi:type': 'xsi:type',
} as const

export type UmlTag = never

function isValidTag(_tag: string | undefined): _tag is UmlTag {
  return false
}

const AbstractTypes = {
  Action: 'Action',
  ActivityEdge: 'ActivityEdge',
  ActivityGroup: 'ActivityGroup',
  ActivityNode: 'ActivityNode',
  Behavior: 'Behavior',
  BehavioralFeature: 'BehavioralFeature',
  BehavioredClassifier: 'BehavioredClassifier',
  CallAction: 'CallAction',
  Classifier: 'Classifier',
  ConnectableElement: 'ConnectableElement',
  ControlNode: 'ControlNode',
  DeployedArtifact: 'DeployedArtifact',
  DeploymentTarget: 'DeploymentTarget',
  DirectedRelationship: 'DirectedRelationship',
  Element: 'Element',
  EncapsulatedClassifier: 'EncapsulatedClassifier',
  Event: 'Event',
  ExecutableNode: 'ExecutableNode',
  ExecutionSpecification: 'ExecutionSpecification',
  Feature: 'Feature',
  FinalNode: 'FinalNode',
  InteractionFragment: 'InteractionFragment',
  InvocationAction: 'InvocationAction',
  LinkAction: 'LinkAction',
  LiteralSpecification: 'LiteralSpecification',
  MessageEnd: 'MessageEnd',
  MessageEvent: 'MessageEvent',
  MultiplicityElement: 'MultiplicityElement',
  NamedElement: 'NamedElement',
  Namespace: 'Namespace',
  ObjectNode: 'ObjectNode',
  Observation: 'Observation',
  PackageableElement: 'PackageableElement',
  ParameterableElement: 'ParameterableElement',
  Pin: 'Pin',
  RedefinableElement: 'RedefinableElement',
  Relationship: 'Relationship',
  StructuralFeature: 'StructuralFeature',
  StructuralFeatureAction: 'StructuralFeatureAction',
  StructuredClassifier: 'StructuredClassifier',
  TemplateableElement: 'TemplateableElement',
  Type: 'Type',
  TypedElement: 'TypedElement',
  ValueSpecification: 'ValueSpecification',
  VariableAction: 'VariableAction',
  Vertex: 'Vertex',
  WriteLinkAction: 'WriteLinkAction',
  WriteStructuralFeatureAction: 'WriteStructuralFeatureAction',
  WriteVariableAction: 'WriteVariableAction',
} as const

export type UmlAbstractType = (typeof AbstractTypes)[keyof typeof AbstractTypes]

const Types = {
  Abstraction: 'Abstraction',
  AcceptCallAction: 'AcceptCallAction',
  AcceptEventAction: 'AcceptEventAction',
  ActionExecutionSpecification: 'ActionExecutionSpecification',
  ActionInputPin: 'ActionInputPin',
  Activity: 'Activity',
  ActivityFinalNode: 'ActivityFinalNode',
  ActivityParameterNode: 'ActivityParameterNode',
  ActivityPartition: 'ActivityPartition',
  Actor: 'Actor',
  AddStructuralFeatureValueAction: 'AddStructuralFeatureValueAction',
  AddVariableValueAction: 'AddVariableValueAction',
  AnyReceiveEvent: 'AnyReceiveEvent',
  Artifact: 'Artifact',
  Association: 'Association',
  AssociationClass: 'AssociationClass',
  BehaviorExecutionSpecification: 'BehaviorExecutionSpecification',
  BroadcastSignalAction: 'BroadcastSignalAction',
  CallBehaviorAction: 'CallBehaviorAction',
  CallEvent: 'CallEvent',
  CallOperationAction: 'CallOperationAction',
  CentralBufferNode: 'CentralBufferNode',
  ChangeEvent: 'ChangeEvent',
  Class: 'Class',
  ClassifierTemplateParameter: 'ClassifierTemplateParameter',
  Clause: 'Clause',
  ClearAssociationAction: 'ClearAssociationAction',
  ClearStructuralFeatureAction: 'ClearStructuralFeatureAction',
  ClearVariableAction: 'ClearVariableAction',
  Collaboration: 'Collaboration',
  CollaborationUse: 'CollaborationUse',
  CombinedFragment: 'CombinedFragment',
  Comment: 'Comment',
  CommunicationPath: 'CommunicationPath',
  Component: 'Component',
  ComponentRealization: 'ComponentRealization',
  ConditionalNode: 'ConditionalNode',
  ConnectableElementTemplateParameter: 'ConnectableElementTemplateParameter',
  ConnectionPointReference: 'ConnectionPointReference',
  Connector: 'Connector',
  ConnectorEnd: 'ConnectorEnd',
  ConsiderIgnoreFragment: 'ConsiderIgnoreFragment',
  Constraint: 'Constraint',
  Continuation: 'Continuation',
  ControlFlow: 'ControlFlow',
  CreateLinkAction: 'CreateLinkAction',
  CreateLinkObjectAction: 'CreateLinkObjectAction',
  CreateObjectAction: 'CreateObjectAction',
  DataStoreNode: 'DataStoreNode',
  DataType: 'DataType',
  DecisionNode: 'DecisionNode',
  Dependency: 'Dependency',
  Deployment: 'Deployment',
  DeploymentSpecification: 'DeploymentSpecification',
  DestroyLinkAction: 'DestroyLinkAction',
  DestroyObjectAction: 'DestroyObjectAction',
  DestructionOccurrenceSpecification: 'DestructionOccurrenceSpecification',
  Device: 'Device',
  Duration: 'Duration',
  DurationConstraint: 'DurationConstraint',
  DurationInterval: 'DurationInterval',
  DurationObservation: 'DurationObservation',
  ElementImport: 'ElementImport',
  EnumerationLiteral: 'EnumerationLiteral',
  Enumeration: 'Enumeration',
  ExecutionEnvironment: 'ExecutionEnvironment',
  ExceptionHandler: 'ExceptionHandler',
  ExecutionOccurrenceSpecification: 'ExecutionOccurrenceSpecification',
  ExpansionNode: 'ExpansionNode',
  ExpansionRegion: 'ExpansionRegion',
  Expression: 'Expression',
  Extend: 'Extend',
  Extension: 'Extension',
  ExtensionEnd: 'ExtensionEnd',
  ExtensionPoint: 'ExtensionPoint',
  FinalState: 'FinalState',
  FlowFinalNode: 'FlowFinalNode',
  ForkNode: 'ForkNode',
  FunctionBehavior: 'FunctionBehavior',
  Gate: 'Gate',
  Generalization: 'Generalization',
  GeneralizationSet: 'GeneralizationSet',
  GeneralOrdering: 'GeneralOrdering',
  Image: 'Image',
  Include: 'Include',
  InformationFlow: 'InformationFlow',
  InformationItem: 'InformationItem',
  InitialNode: 'InitialNode',
  InputPin: 'InputPin',
  InstanceSpecification: 'InstanceSpecification',
  InstanceValue: 'InstanceValue',
  Interaction: 'Interaction',
  InteractionConstraint: 'InteractionConstraint',
  InteractionOperand: 'InteractionOperand',
  InteractionUse: 'InteractionUse',
  Interface: 'Interface',
  InterfaceRealization: 'InterfaceRealization',
  InterruptibleActivityRegion: 'InterruptibleActivityRegion',
  Interval: 'Interval',
  IntervalConstraint: 'IntervalConstraint',
  JoinNode: 'JoinNode',
  Lifeline: 'Lifeline',
  LinkEndCreationData: 'LinkEndCreationData',
  LinkEndData: 'LinkEndData',
  LinkEndDestructionData: 'LinkEndDestructionData',
  LiteralBoolean: 'LiteralBoolean',
  LiteralInteger: 'LiteralInteger',
  LiteralNull: 'LiteralNull',
  LiteralReal: 'LiteralReal',
  LiteralString: 'LiteralString',
  LiteralUnlimitedNatural: 'LiteralUnlimitedNatural',
  LoopNode: 'LoopNode',
  Manifestation: 'Manifestation',
  MergeNode: 'MergeNode',
  Message: 'Message',
  MessageOccurrenceSpecification: 'MessageOccurrenceSpecification',
  Model: 'Model',
  Node: 'Node',
  ObjectFlow: 'ObjectFlow',
  OccurrenceSpecification: 'OccurrenceSpecification',
  OpaqueAction: 'OpaqueAction',
  OpaqueBehavior: 'OpaqueBehavior',
  OpaqueExpression: 'OpaqueExpression',
  Operation: 'Operation',
  OperationTemplateParameter: 'OperationTemplateParameter',
  OutputPin: 'OutputPin',
  Package: 'Package',
  PackageImport: 'PackageImport',
  PackageMerge: 'PackageMerge',
  Parameter: 'Parameter',
  ParameterSet: 'ParameterSet',
  PartDecomposition: 'PartDecomposition',
  Port: 'Port',
  PrimitiveType: 'PrimitiveType',
  Profile: 'Profile',
  ProfileApplication: 'ProfileApplication',
  Property: 'Property',
  ProtocolConformance: 'ProtocolConformance',
  ProtocolStateMachine: 'ProtocolStateMachine',
  ProtocolTransition: 'ProtocolTransition',
  Pseudostate: 'Pseudostate',
  QualifierValue: 'QualifierValue',
  RaiseExceptionAction: 'RaiseExceptionAction',
  ReadExtentAction: 'ReadExtentAction',
  ReadIsClassifiedObjectAction: 'ReadIsClassifiedObjectAction',
  ReadLinkAction: 'ReadLinkAction',
  ReadLinkObjectEndAction: 'ReadLinkObjectEndAction',
  ReadLinkObjectEndQualifierAction: 'ReadLinkObjectEndQualifierAction',
  ReadSelfAction: 'ReadSelfAction',
  ReadStructuralFeatureAction: 'ReadStructuralFeatureAction',
  ReadVariableAction: 'ReadVariableAction',
  Realization: 'Realization',
  Reception: 'Reception',
  ReclassifyObjectAction: 'ReclassifyObjectAction',
  RedefinableTemplateSignature: 'RedefinableTemplateSignature',
  ReduceAction: 'ReduceAction',
  Region: 'Region',
  RemoveStructuralFeatureValueAction: 'RemoveStructuralFeatureValueAction',
  RemoveVariableValueAction: 'RemoveVariableValueAction',
  ReplyAction: 'ReplyAction',
  SendObjectAction: 'SendObjectAction',
  SendSignalAction: 'SendSignalAction',
  SequenceNode: 'SequenceNode',
  Signal: 'Signal',
  SignalEvent: 'SignalEvent',
  Slot: 'Slot',
  StartClassifierBehaviorAction: 'StartClassifierBehaviorAction',
  StartObjectBehaviorAction: 'StartObjectBehaviorAction',
  State: 'State',
  StateInvariant: 'StateInvariant',
  StateMachine: 'StateMachine',
  Stereotype: 'Stereotype',
  StringExpression: 'StringExpression',
  StructuredActivityNode: 'StructuredActivityNode',
  Substitution: 'Substitution',
  TemplateBinding: 'TemplateBinding',
  TemplateParameter: 'TemplateParameter',
  TemplateParameterSubstitution: 'TemplateParameterSubstitution',
  TemplateSignature: 'TemplateSignature',
  TestIdentityAction: 'TestIdentityAction',
  TimeConstraint: 'TimeConstraint',
  TimeEvent: 'TimeEvent',
  TimeExpression: 'TimeExpression',
  TimeInterval: 'TimeInterval',
  TimeObservation: 'TimeObservation',
  Transition: 'Transition',
  Trigger: 'Trigger',
  UnmarshallAction: 'UnmarshallAction',
  Usage: 'Usage',
  UseCase: 'UseCase',
  ValuePin: 'ValuePin',
  ValueSpecificationAction: 'ValueSpecificationAction',
  Variable: 'Variable',
} as const

export type UmlType = (typeof Types)[keyof typeof Types]

function isValidType(type: string | undefined): type is UmlType {
  return type !== undefined && type in Types
}

// The root element may use its type as its tag
function getTagType(element: GraphNode | GraphEdge) {
  const parsedName = parseNamespace(element.tag)
  const actualName =
    typeof parsedName === 'object' ? parsedName.name : parsedName
  if (isValidType(actualName)) {
    return actualName
  }
  return undefined
}

function getType(element: Attributable) {
  const typeAttribute = element.getAttribute(Attributes['xmi:type']) ?? element.getAttribute(Attributes['xsi:type'])
  const type = typeAttribute?.value.literal
  if (isValidType(type)) {
    return type
  }
  return undefined
}

const relationshipToEdgeTag: Partial<Record<UmlType, string>> = {
  [Types.Abstraction]: 'abstraction',
  [Types.Association]: 'association', // TODO: Validate
  [Types.AssociationClass]: 'associationClass', // TODO: Validate
  [Types.CommunicationPath]: 'communicationPath', // TODO: Validate
  [Types.ComponentRealization]: 'componentRealization',
  [Types.Dependency]: 'dependency',
  [Types.Deployment]: 'deployment', // TODO: Validate
  [Types.ElementImport]: 'elementImport',
  [Types.Extend]: 'extend',
  [Types.Extension]: 'extension', // TODO: Validate
  [Types.Generalization]: 'generalization',
  [Types.Include]: 'include',
  [Types.InformationFlow]: 'informationFlow', // TODO: Validate
  [Types.InterfaceRealization]: 'interfaceRealization',
  [Types.Manifestation]: 'manifestation', // TODO: Validate
  [Types.PackageImport]: 'packageImport',
  [Types.PackageMerge]: 'packageMerge',
  [Types.ProfileApplication]: 'profileApplication',
  [Types.ProtocolConformance]: 'protocolConformance', // TODO: Validate
  [Types.ProtocolTransition]: 'protocolTransition', // TODO: Validate
  [Types.Realization]: 'realization',
  [Types.Substitution]: 'substitution',
  [Types.TemplateBinding]: 'templateBinding',
  [Types.Transition]: 'transition',
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
      `Could not determine edge tag for ${relationship.id} with original tag ${relationship.tag} and type ${getType(relationship)}`,
    )
  }
  return tag
}

export function transformNodeToEdgeCallback(node: GraphNode, sources: GraphNode | GraphNode[] = [], targets: GraphNode | GraphNode[] = []): Callback {
  const edgeSources = Array.isArray(sources) ? sources : [sources]
  const edgeTargets = Array.isArray(targets) ? targets : [targets]
  const tag = getEdgeTagForRelationship(node)
  return () => {
    const children = node.children
    children.forEach((child) => {
      node.removeChild(child)
      node.parent?.addChild(child)
    })
    transformNodeToEdge(node, edgeSources, edgeTargets, tag)
  }
}

export const Uml = {
  AbstractTypes,
  Attributes,
  Types,
  typeAttributeName: Attributes['xmi:type'],
  isValidTag,
  isValidType,
  getTagType,
  getType,
  getEdgeTagForRelationship,
} as const
