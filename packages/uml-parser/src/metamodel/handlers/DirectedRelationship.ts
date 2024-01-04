import type { GraphNode } from '@cm2ml/ir'

import { DirectedRelationship } from '../metamodel'

export const DirectedRelationshipHandler = DirectedRelationship.createHandler(
  (directedRelationship, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_source(directedRelationship)
    addEdge_target(directedRelationship)
  },
)

function addEdge_source(_directedRelationship: GraphNode) {
  // TODO
  // /source : Element [1..*]{union, subsets Relationship::relatedElement} (opposite A_source_directedRelationship::directedRelationship)
  // Specifies the source Element(s) of the DirectedRelationship.
}

function addEdge_target(_directedRelationship: GraphNode) {
  // TODO
  // /target : Element [1..*]{union, subsets Relationship::relatedElement} (opposite A_target_directedRelationship::directedRelationship)
  // Specifies the target Element(s) of the DirectedRelationship.
}
