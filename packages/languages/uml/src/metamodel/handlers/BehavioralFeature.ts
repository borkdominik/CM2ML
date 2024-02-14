import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Behavior, BehavioralFeature } from '../uml-metamodel'

export const BehavioralFeatureHandler = BehavioralFeature.createHandler(
  (behavioralFeature, { onlyContainmentAssociations }) => {
    const method = resolveFromAttribute(behavioralFeature, 'method', { type: Behavior })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_method(behavioralFeature, method)
    addEdge_ownedParameter(behavioralFeature)
    addEdge_ownedParameterSet(behavioralFeature)
    addEdge_raisedException(behavioralFeature)
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

function addEdge_ownedParameter(_behavioralFeature: GraphNode) {
  // TODO/Association
  // ♦ ownedParameter : Parameter [0..*]{ordered, subsets Namespace::ownedMember} (opposite A_ownedParameter_ownerFormalParam::ownerFormalParam )
  // The ordered set of formal Parameters of this BehavioralFeature.
}

function addEdge_ownedParameterSet(_behavioralFeature: GraphNode) {
  // TODO/Association
  // ♦ ownedParameterSet : ParameterSet [0..*]{subsets Namespace::ownedMember} (opposite A_ownedParameterSet_behavioralFeature::behavioralFeature )
  // The ParameterSets owned by this BehavioralFeature.
}

function addEdge_raisedException(_behavioralFeature: GraphNode) {
  // TODO/Association
  // raisedException : Type [0..*] (opposite A_raisedException_behavioralFeature::behavioralFeature)
  // The Types representing exceptions that may be raised during an invocation of this BehavioralFeature.
}
