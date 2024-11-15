import type { GraphNode } from '@cm2ml/ir'

import { Relationship } from '../uml-metamodel'

export const RelationshipHandler = Relationship.createHandler(
  (relationship, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_relatedElement(relationship)
  },
)

function addEdge_relatedElement(_relationship: GraphNode) {
  // /relatedElement : Element [1..*]{union} (opposite A_relatedElement_relationship::relationship)
  // Specifies the elements related by the Relationship.

  // Added by AssociationHandler::addEdge_endType and DirectedRelationshipHandler::addEdge_{source, target}
}
