import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Behavior, BehavioredClassifier, InterfaceRealization } from '../uml-metamodel'

export const BehavioredClassifierHandler = BehavioredClassifier.createHandler(
  (behavioredClassifier, { onlyContainmentAssociations }) => {
    const classifierBehavior = resolve(behavioredClassifier, 'classifierBehavior', { type: Behavior })
    const interfaceRealizations = resolve(behavioredClassifier, 'interfaceRealization', { many: true, type: InterfaceRealization })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_classifierBehavior(behavioredClassifier, classifierBehavior)
    addEdge_interfaceRealization(behavioredClassifier, interfaceRealizations)
    addEdge_ownedBehavior(behavioredClassifier)
  },
)

function addEdge_classifierBehavior(behavioredClassifier: GraphNode, classifierBehavior: GraphNode | undefined) {
  // classifierBehavior : Behavior [0..1]{subsets BehavioredClassifier::ownedBehavior} (opposite A_classifierBehavior_behavioredClassifier::behavioredClassifier )
  // A Behavior that specifies the behavior of the BehavioredClassifier itself.
  if (!classifierBehavior) {
    return
  }
  behavioredClassifier.model.addEdge('classifierBehavior', behavioredClassifier, classifierBehavior)
}

function addEdge_interfaceRealization(behavioredClassifier: GraphNode, interfaceRealizations: GraphNode[]) {
  // ♦ interfaceRealization : InterfaceRealization [0..*]{subsets Element::ownedElement, subsets NamedElement::clientDependency} (opposite InterfaceRealization::implementingClassifier)
  // The set of InterfaceRealizations owned by the BehavioredClassifier. Interface realizations reference the Interfaces of which the BehavioredClassifier is an implementation.
  interfaceRealizations.forEach((interfaceRealization) => {
    behavioredClassifier.model.addEdge('interfaceRealization', behavioredClassifier, interfaceRealization)
  })
}

function addEdge_ownedBehavior(_behavioredClassifier: GraphNode) {
  // TODO/Association
  // ♦ ownedBehavior : Behavior [0..*]{subsets Namespace::ownedMember} (opposite A_ownedBehavior_behavioredClassifier::behavioredClassifier )
  // Behaviors owned by a BehavioredClassifier.
}
