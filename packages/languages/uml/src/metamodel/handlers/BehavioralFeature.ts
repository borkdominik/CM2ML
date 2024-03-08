import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Behavior, BehavioralFeature, Operation, Parameter, ParameterSet, Type } from '../uml-metamodel'

export const BehavioralFeatureHandler = BehavioralFeature.createHandler(
  (behavioralFeature, { onlyContainmentAssociations }) => {
    const method = resolve(behavioralFeature, 'method', { type: Behavior })
    const ownedParameters = resolve(behavioralFeature, 'ownedParameter', { many: true, type: Parameter })
    const ownedParameterSet = resolve(behavioralFeature, 'ownedParameterSet', { many: true, type: ParameterSet })
    const raisedExceptions = resolve(behavioralFeature, 'raisedException', { many: true, type: Type })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_method(behavioralFeature, method)
    addEdge_ownedParameter(behavioralFeature, ownedParameters)
    addEdge_ownedParameterSet(behavioralFeature, ownedParameterSet)
    addEdge_raisedException(behavioralFeature, raisedExceptions)
  },
  {
    [Uml.Attributes.concurrency]: 'sequential',
    [Uml.Attributes.isAbstract]: 'false',
  },
)

function addEdge_method(behavioralFeature: GraphNode, method: GraphNode | undefined) {
  // method : Behavior [0..*] (opposite Behavior::specification)
  // A Behavior that implements the BehavioralFeature. There may be at most one Behavior for a particular pairing of a Classifier (as owner of the Behavior) and a BehavioralFeature (as specification of the Behavior).
  if (!method) {
    return
  }
  behavioralFeature.model.addEdge('method', behavioralFeature, method)
}

function addEdge_ownedParameter(behavioralFeature: GraphNode, ownedParameters: GraphNode[]) {
  // ♦ ownedParameter : Parameter [0..*]{ordered, subsets Namespace::ownedMember} (opposite A_ownedParameter_ownerFormalParam::ownerFormalParam )
  // The ordered set of formal Parameters of this BehavioralFeature.
  if (Operation.isAssignable(behavioralFeature)) {
    // OperationHandler already adds ownedParameter edges
    return
  }
  ownedParameters.forEach((ownedParameter) => {
    behavioralFeature.model.addEdge('ownedParameter', behavioralFeature, ownedParameter)
  })
}

function addEdge_ownedParameterSet(behavioralFeature: GraphNode, ownedParameterSet: GraphNode[]) {
  // ♦ ownedParameterSet : ParameterSet [0..*]{subsets Namespace::ownedMember} (opposite A_ownedParameterSet_behavioralFeature::behavioralFeature )
  // The ParameterSets owned by this BehavioralFeature.
  ownedParameterSet.forEach((parameterSet) => {
    behavioralFeature.model.addEdge('ownedParameterSet', behavioralFeature, parameterSet)
  })
}

function addEdge_raisedException(behavioralFeature: GraphNode, raisedExceptions: GraphNode[]) {
  // raisedException : Type [0..*] (opposite A_raisedException_behavioralFeature::behavioralFeature)
  // The Types representing exceptions that may be raised during an invocation of this BehavioralFeature.
  if (Operation.isAssignable(behavioralFeature)) {
    // OperationHandler already adds raisedException edges
    return
  }
  raisedExceptions.forEach((raisedException) => {
    behavioralFeature.model.addEdge('raisedException', behavioralFeature, raisedException)
  })
}
