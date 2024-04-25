import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Behavior, BehavioralFeature, Constraint, Parameter, ParameterSet } from '../uml-metamodel'

export const BehaviorHandler = Behavior.createHandler(
  (behavior, { onlyContainmentAssociations }) => {
    const ownedParameters = resolve(behavior, 'ownedParameter', { many: true, type: Parameter })
    const ownedParameterSets = resolve(behavior, 'ownedParameterSet', { many: true, type: ParameterSet })
    const postconditions = resolve(behavior, 'postcondition', { many: true, type: Constraint })
    const preconditions = resolve(behavior, 'precondition', { many: true, type: Constraint })
    const redefinedBehaviors = resolve(behavior, 'redefinedBehavior', { many: true, type: Behavior })
    const specification = resolve(behavior, 'specification', { type: BehavioralFeature })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_context(behavior)
    addEdge_ownedParameter(behavior, ownedParameters)
    addEdge_ownedParameterSet(behavior, ownedParameterSets)
    addEdge_postcondition(behavior, postconditions)
    addEdge_precondition(behavior, preconditions)
    addEdge_specification(behavior, specification)
    addEdge_redefinedBehavior(behavior, redefinedBehaviors)
  },
  {
    [Uml.Attributes.isReentrant]: { type: 'boolean', defaultValue: 'true' },
  },
)

function addEdge_context(_behavior: GraphNode) {
  // TODO/Association
  // /context : BehavioredClassifier [0..1]{subsets RedefinableElement::redefinitionContext} (opposite A_context_behavior::behavior)
  // The BehavioredClassifier that is the context for the execution of the Behavior. A Behavior that is directly owned as a nestedClassifier does not have a context. Otherwise, to determine the context of a Behavior, find the first BehavioredClassifier reached by following the chain of owner relationships from the Behavior, if any. If there is such a BehavioredClassifier, then it is the context, unless it is itself a Behavior with a non-empty context, in which case that is also the context for the original Behavior. For example, following this algorithm, the context of an entry Behavior in a StateMachine is the BehavioredClassifier that owns the StateMachine. The features of the context BehavioredClassifier as well as the Elements visible to the context Classifier are visible to the Behavior.
}

function addEdge_ownedParameter(behavior: GraphNode, ownedParameters: GraphNode[]) {
  // ♦ ownedParameter : Parameter [0..*]{ordered, subsets Namespace::ownedMember} (opposite A_ownedParameter_behavior::behavior)
  // References a list of Parameters to the Behavior which describes the order and type of arguments that can be given when the Behavior is invoked and of the values which will be returned when the Behavior completes its execution.
  ownedParameters.forEach((ownedParameter) => {
    behavior.model.addEdge('ownedParameter', behavior, ownedParameter)
  })
}

function addEdge_ownedParameterSet(behavior: GraphNode, ownedParameterSets: GraphNode[]) {
  // ♦ ownedParameterSet : ParameterSet [0..*]{subsets Namespace::ownedMember} (opposite A_ownedParameterSet_behavior::behavior)
  // The ParameterSets owned by this Behavior.
  ownedParameterSets.forEach((ownedParameterSet) => {
    behavior.model.addEdge('ownedParameterSet', behavior, ownedParameterSet)
  })
}

function addEdge_postcondition(behavior: GraphNode, postconditions: GraphNode[]) {
  // ♦ postcondition : Constraint [0..*]{subsets Namespace::ownedRule} (opposite A_postcondition_behavior::behavior)
  // An optional set of Constraints specifying what is fulfilled after the execution of the Behavior is completed, if its precondition was fulfilled before its invocation.
  postconditions.forEach((postcondition) => {
    behavior.model.addEdge('postcondition', behavior, postcondition)
  })
}

function addEdge_precondition(behavior: GraphNode, preconditions: GraphNode[]) {
  // ♦ precondition : Constraint [0..*]{subsets Namespace::ownedRule} (opposite A_precondition_behavior::behavior)
  // An optional set of Constraints specifying what must be fulfilled before the Behavior is invoked.
  preconditions.forEach((precondition) => {
    behavior.model.addEdge('precondition', behavior, precondition)
  })
}

function addEdge_specification(behavior: GraphNode, specification: GraphNode | undefined) {
  // specification : BehavioralFeature [0..1] (opposite BehavioralFeature::method)
  // Designates a BehavioralFeature that the Behavior implements. The BehavioralFeature must be owned by the BehavioredClassifier that owns the Behavior or be inherited by it. The Parameters of the BehavioralFeature and the implementing Behavior must match. A Behavior does not need to have a specification, in which case it either is the classifierBehavior of a BehavioredClassifier or it can only be invoked by another Behavior of the Classifier.
  if (!specification) {
    return
  }
  behavior.model.addEdge('specification', behavior, specification)
}

function addEdge_redefinedBehavior(behavior: GraphNode, redefinedBehaviors: GraphNode[]) {
  // redefinedBehavior : Behavior [0..*]{subsets Classifier::redefinedClassifier} (opposite A_redefinedBehavior_behavior::behavior)
  // References the Behavior that this Behavior redefines. A subtype of Behavior may redefine any other subtype of Behavior. If the Behavior implements a BehavioralFeature, it replaces the redefined Behavior. If the Behavior is a classifierBehavior, it extends the redefined Behavior.
  redefinedBehaviors.forEach((redefinedBehavior) => {
    behavior.model.addEdge('redefinedBehavior', behavior, redefinedBehavior)
  })
}
