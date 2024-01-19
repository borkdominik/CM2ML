import type { GraphNode } from '@cm2ml/ir'

import { BehavioredClassifier } from '../uml-metamodel'

export const BehavioredClassifierHandler = BehavioredClassifier.createHandler(
  (behavioredClassifier, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_classifierBehavior(behavioredClassifier)
    addEdge_interfaceRealization(behavioredClassifier)
    addEdge_ownedBehavior(behavioredClassifier)
  },
)

function addEdge_classifierBehavior(_behavioredClassifier: GraphNode) {
  // TODO/Association
  // classifierBehavior : Behavior [0..1]{subsets BehavioredClassifier::ownedBehavior} (opposite A_classifierBehavior_behavioredClassifier::behavioredClassifier )
  // A Behavior that specifies the behavior of the BehavioredClassifier itself.
}

function addEdge_interfaceRealization(_behavioredClassifier: GraphNode) {
  // TODO/Association
  // ♦ interfaceRealization : InterfaceRealization [0..*]{subsets Element::ownedElement, subsets NamedElement::clientDependency} (opposite InterfaceRealization::implementingClassifier)
  // The set of InterfaceRealizations owned by the BehavioredClassifier. Interface realizations reference the Interfaces of which the BehavioredClassifier is an implementation.
}

function addEdge_ownedBehavior(_behavioredClassifier: GraphNode) {
  // TODO/Association
  // ♦ ownedBehavior : Behavior [0..*]{subsets Namespace::ownedMember} (opposite A_ownedBehavior_behavioredClassifier::behavioredClassifier )
  // Behaviors owned by a BehavioredClassifier.
}
