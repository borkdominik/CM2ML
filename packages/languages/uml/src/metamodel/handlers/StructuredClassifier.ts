import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Class, Connector, Property, StructuredClassifier } from '../uml-metamodel'

export const StructuredClassifierHandler = StructuredClassifier.createHandler(
  (structuredClassifier, { onlyContainmentAssociations }) => {
    const ownedAttributes = resolve(structuredClassifier, 'ownedAttribute', { many: true, type: Property })
    const ownedConnectors = resolve(structuredClassifier, 'ownedConnector', { many: true, type: Connector })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_ownedAttribute(structuredClassifier, ownedAttributes)
    addEdge_ownedConnector(structuredClassifier, ownedConnectors)
    addEdge_part(structuredClassifier)
    addEdge_role(structuredClassifier)
  },
)

function addEdge_ownedAttribute(structuredClassifier: GraphNode, ownedAttributes: GraphNode[]) {
  // ♦ ownedAttribute : Property [0..*]{ordered, subsets Classifier::attribute, subsets StructuredClassifier::role, subsets Namespace::ownedMember} (opposite A_ownedAttribute_structuredClassifier::structuredClassifier)
  // The Properties owned by the StructuredClassifier.
  if (Class.isAssignable(structuredClassifier)) {
    // ClassHandler already adds the ownedAttribute edges
    return
  }
  ownedAttributes.forEach((ownedAttribute) => {
    structuredClassifier.model.addEdge('ownedAttribute', structuredClassifier, ownedAttribute)
  })
}

function addEdge_ownedConnector(structuredClassifier: GraphNode, ownedConnectors: GraphNode[]) {
  // ♦ ownedConnector : Connector [0..*]{subsets Classifier::feature, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Namespace::ownedMember} (opposite A_ownedConnector_structuredClassifier::structuredClassifier)
  // The connectors owned by the StructuredClassifier.
  ownedConnectors.forEach((ownedConnector) => {
    structuredClassifier.model.addEdge('ownedConnector', structuredClassifier, ownedConnector)
  })
}

function addEdge_part(_structuredClassifier: GraphNode) {
  // TODO/Association
  // /part : Property [0..*]{} (opposite A_part_structuredClassifier::structuredClassifier)
  // The Properties specifying instances that the StructuredClassifier owns by composition. This collection is derived, selecting those owned Properties where isComposite is true.
}

function addEdge_role(_structuredClassifier: GraphNode) {
  // TODO/Association
  // /role : ConnectableElement [0..*]{union, subsets Namespace::member} (opposite A_role_structuredClassifier::structuredClassifier)
  // The roles that instances may play in this StructuredClassifier.
}
