import type { GraphNode } from '@cm2ml/ir'
import { Metamodel } from '@cm2ml/ir'
import type { Callback } from '@cm2ml/metamodel'
import { transformNodeToEdge } from '@cm2ml/metamodel'

const attributes = [
  'aggregation',
  'alias',
  'allowSubstitutable',
  'body',
  'concurrency',
  'content',
  'default',
  'deploymentLocation',
  'direction',
  'effect',
  'executionLocation',
  'fileName',
  'firstEvent',
  'format',
  'general',
  'interactionOperator',
  'isAbstract',
  'isActive',
  'isAssured',
  'isBehavior',
  'isCombineDuplicate',
  'isComposite',
  'isConjugated',
  'isControl',
  'isControlType',
  'isCovering',
  'isDerived',
  'isDerivedUnion',
  'isDestroyDuplicates',
  'isDestroyLinks',
  'isDestroyOwnedObjects',
  'isDeterminate',
  'isDimension',
  'isDirect',
  'isDisjoint',
  'isExternal',
  'isException',
  'isFinalSpecialization',
  'isID',
  'isIndirectlyInstantiated',
  'isLeaf',
  'isLocallyReentrant',
  'isMulticast',
  'isMultireceive',
  'isOrdered',
  'isOrthogonal',
  'isQuery',
  'isReadOnly',
  'isReentrant',
  'isRelative',
  'isRemoveDuplicates',
  'isReplaceAll',
  'isRequired',
  'isService',
  'isSimple',
  'isSingleExecution',
  'isStatic',
  'isStream',
  'isStrict',
  'isSubmachineState',
  'isSubstitutable',
  'isSynchronous',
  'isTestedFirst',
  'isUnique',
  'isUnmarshall',
  'kind',
  'language',
  'location',
  'lower',
  'messageKind',
  'messageSort',
  'mode',
  'mustIsolate',
  'name',
  'ordering',
  'qualifiedName',
  'setting',
  'symbol',
  'upper',
  'URI',
  'value',
  'viewpoint',
  'visibility',
  'xmi:id',
  'xmi:type',
  'xsi:type',
] as const

export type UmlAttribute = (typeof attributes)[number]

export type UmlTag = never

const abstractTypes = {
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

export type UmlAbstractType = (typeof abstractTypes)[keyof typeof abstractTypes]

const types = [
  'Abstraction',
  'AcceptCallAction',
  'AcceptEventAction',
  'ActionExecutionSpecification',
  'ActionInputPin',
  'Activity',
  'ActivityFinalNode',
  'ActivityParameterNode',
  'ActivityPartition',
  'Actor',
  'AddStructuralFeatureValueAction',
  'AddVariableValueAction',
  'AnyReceiveEvent',
  'Artifact',
  'Association',
  'AssociationClass',
  'BehaviorExecutionSpecification',
  'BroadcastSignalAction',
  'CallBehaviorAction',
  'CallEvent',
  'CallOperationAction',
  'CentralBufferNode',
  'ChangeEvent',
  'Class',
  'ClassifierTemplateParameter',
  'Clause',
  'ClearAssociationAction',
  'ClearStructuralFeatureAction',
  'ClearVariableAction',
  'Collaboration',
  'CollaborationUse',
  'CombinedFragment',
  'Comment',
  'CommunicationPath',
  'Component',
  'ComponentRealization',
  'ConditionalNode',
  'ConnectableElementTemplateParameter',
  'ConnectionPointReference',
  'Connector',
  'ConnectorEnd',
  'ConsiderIgnoreFragment',
  'Constraint',
  'Continuation',
  'ControlFlow',
  'CreateLinkAction',
  'CreateLinkObjectAction',
  'CreateObjectAction',
  'DataStoreNode',
  'DataType',
  'DecisionNode',
  'Dependency',
  'Deployment',
  'DeploymentSpecification',
  'DestroyLinkAction',
  'DestroyObjectAction',
  'DestructionOccurrenceSpecification',
  'Device',
  'Duration',
  'DurationConstraint',
  'DurationInterval',
  'DurationObservation',
  'ElementImport',
  'EnumerationLiteral',
  'Enumeration',
  'ExecutionEnvironment',
  'ExceptionHandler',
  'ExecutionOccurrenceSpecification',
  'ExpansionNode',
  'ExpansionRegion',
  'Expression',
  'Extend',
  'Extension',
  'ExtensionEnd',
  'ExtensionPoint',
  'FinalState',
  'FlowFinalNode',
  'ForkNode',
  'FunctionBehavior',
  'Gate',
  'Generalization',
  'GeneralizationSet',
  'GeneralOrdering',
  'Image',
  'Include',
  'InformationFlow',
  'InformationItem',
  'InitialNode',
  'InputPin',
  'InstanceSpecification',
  'InstanceValue',
  'Interaction',
  'InteractionConstraint',
  'InteractionOperand',
  'InteractionUse',
  'Interface',
  'InterfaceRealization',
  'InterruptibleActivityRegion',
  'Interval',
  'IntervalConstraint',
  'JoinNode',
  'Lifeline',
  'LinkEndCreationData',
  'LinkEndData',
  'LinkEndDestructionData',
  'LiteralBoolean',
  'LiteralInteger',
  'LiteralNull',
  'LiteralReal',
  'LiteralString',
  'LiteralUnlimitedNatural',
  'LoopNode',
  'Manifestation',
  'MergeNode',
  'Message',
  'MessageOccurrenceSpecification',
  'Model',
  'Node',
  'ObjectFlow',
  'OccurrenceSpecification',
  'OpaqueAction',
  'OpaqueBehavior',
  'OpaqueExpression',
  'Operation',
  'OperationTemplateParameter',
  'OutputPin',
  'Package',
  'PackageImport',
  'PackageMerge',
  'Parameter',
  'ParameterSet',
  'PartDecomposition',
  'Port',
  'PrimitiveType',
  'Profile',
  'ProfileApplication',
  'Property',
  'ProtocolConformance',
  'ProtocolStateMachine',
  'ProtocolTransition',
  'Pseudostate',
  'QualifierValue',
  'RaiseExceptionAction',
  'ReadExtentAction',
  'ReadIsClassifiedObjectAction',
  'ReadLinkAction',
  'ReadLinkObjectEndAction',
  'ReadLinkObjectEndQualifierAction',
  'ReadSelfAction',
  'ReadStructuralFeatureAction',
  'ReadVariableAction',
  'Realization',
  'Reception',
  'ReclassifyObjectAction',
  'RedefinableTemplateSignature',
  'ReduceAction',
  'Region',
  'RemoveStructuralFeatureValueAction',
  'RemoveVariableValueAction',
  'ReplyAction',
  'SendObjectAction',
  'SendSignalAction',
  'SequenceNode',
  'Signal',
  'SignalEvent',
  'Slot',
  'StartClassifierBehaviorAction',
  'StartObjectBehaviorAction',
  'State',
  'StateInvariant',
  'StateMachine',
  'Stereotype',
  'StringExpression',
  'StructuredActivityNode',
  'Substitution',
  'TemplateBinding',
  'TemplateParameter',
  'TemplateParameterSubstitution',
  'TemplateSignature',
  'TestIdentityAction',
  'TimeConstraint',
  'TimeEvent',
  'TimeExpression',
  'TimeInterval',
  'TimeObservation',
  'Transition',
  'Trigger',
  'UnmarshallAction',
  'Usage',
  'UseCase',
  'ValuePin',
  'ValueSpecificationAction',
  'Variable',
] as const

export type UmlType = (typeof types)[number]

export const Uml = new class extends Metamodel<UmlAttribute, UmlType, UmlTag> {
  public readonly AbstractTypes = abstractTypes
  public constructor() {
    super({
      attributes,
      idAttribute: 'xmi:id',
      types,
      typeAttributes: ['xmi:type', 'xsi:type'],
      nameAttribute: 'name',
      tags: [],
    })
  }
}()

const relationshipToEdgeTag: Partial<Record<UmlType, string>> = {
  [Uml.Types.Abstraction]: 'abstraction',
  [Uml.Types.Association]: 'association',
  [Uml.Types.AssociationClass]: 'associationClass',
  [Uml.Types.CommunicationPath]: 'communicationPath',
  [Uml.Types.ComponentRealization]: 'componentRealization',
  [Uml.Types.Dependency]: 'dependency',
  [Uml.Types.Deployment]: 'deployment',
  [Uml.Types.ElementImport]: 'elementImport',
  [Uml.Types.Extend]: 'extend',
  [Uml.Types.Extension]: 'extension',
  [Uml.Types.Generalization]: 'generalization',
  [Uml.Types.Include]: 'include',
  [Uml.Types.InformationFlow]: 'informationFlow',
  [Uml.Types.InterfaceRealization]: 'interfaceRealization',
  [Uml.Types.Manifestation]: 'manifestation',
  [Uml.Types.PackageImport]: 'packageImport',
  [Uml.Types.PackageMerge]: 'packageMerge',
  [Uml.Types.ProfileApplication]: 'profileApplication',
  [Uml.Types.ProtocolConformance]: 'protocolConformance',
  [Uml.Types.ProtocolTransition]: 'protocolTransition',
  [Uml.Types.Realization]: 'realization',
  [Uml.Types.Substitution]: 'substitution',
  [Uml.Types.TemplateBinding]: 'templateBinding',
  [Uml.Types.Transition]: 'transition',
  [Uml.Types.Usage]: 'usage',
}

export function transformNodeToEdgeCallback(node: GraphNode, sources: GraphNode | GraphNode[] = [], targets: GraphNode | GraphNode[] = []): Callback {
  const edgeSources = Array.isArray(sources) ? sources : [sources]
  const edgeTargets = Array.isArray(targets) ? targets : [targets]
  const tag = getEdgeTagForRelationship(node)
  return () => {
    transformNodeToEdge(node, edgeSources, edgeTargets, tag)
  }
}

export function getEdgeTagForRelationship(relationship: GraphNode) {
  const type = relationship.model.metamodel.getType(relationship)
  if (!type) {
    throw new Error(`Could not determine type for ${relationship.id}`)
  }
  const tag = relationshipToEdgeTag[type as UmlType]
  if (!tag) {
    throw new Error(
      `Could not determine edge tag for ${relationship.id} with original tag ${relationship.tag} and type ${relationship.type}`,
    )
  }
  return tag
}
