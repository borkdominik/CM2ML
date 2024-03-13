import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

export function addEdge_relatedElement(directedRelationship: GraphNode, ...relatedElements: (GraphNode | undefined)[]) {
  // relatedElement : Element [0..*]{subsets DirectedRelationship::relatedElement} (opposite Element::relationship)
  Stream.from(relatedElements)
    .filterNonNull()
    .distinct()
    .forEach((relatedElement) => {
      directedRelationship.model.addEdge('relatedElement', directedRelationship, relatedElement)
    })
}
