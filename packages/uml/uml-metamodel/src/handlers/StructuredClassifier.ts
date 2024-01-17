import type { GraphNode } from '@cm2ml/ir'

import { StructuredClassifier } from '../uml-metamodel'

export const StructuredClassifierHandler = StructuredClassifier.createHandler(
  (structuredClassifier, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_ownedAttribute(structuredClassifier)
    addEdge_ownedConnector(structuredClassifier)
    addEdge_part(structuredClassifier)
    addEdge_role(structuredClassifier)
  },
)

function addEdge_ownedAttribute(_structuredClassifier: GraphNode) {
  // TODO
  // ♦ ownedAttribute : Property [0..*]{ordered, subsets Classifier::attribute, subsets StructuredClassifier::role, subsets Namespace::ownedMember} (opposite A_ownedAttribute_structuredClassifier::structuredClassifier)
  // The Properties owned by the StructuredClassifier.
}

function addEdge_ownedConnector(_structuredClassifier: GraphNode) {
  // TODO
  // ♦ ownedConnector : Connector [0..*]{subsets Classifier::feature, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Namespace::ownedMember} (opposite A_ownedConnector_structuredClassifier::structuredClassifier)
  // The connectors owned by the StructuredClassifier.
}

function addEdge_part(_structuredClassifier: GraphNode) {
  // TODO
  // /part : Property [0..*]{} (opposite A_part_structuredClassifier::structuredClassifier)
  // The Properties specifying instances that the StructuredClassifier owns by composition. This collection is derived, selecting those owned Properties where isComposite is true.
}

function addEdge_role(_structuredClassifier: GraphNode) {
  // TODO
  // /role : ConnectableElement [0..*]{union, subsets Namespace::member} (opposite A_role_structuredClassifier::structuredClassifier)
  // The roles that instances may play in this StructuredClassifier.
}
