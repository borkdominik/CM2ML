import type { GraphNode } from '@cm2ml/ir'

import { Realization } from '../metamodel'

export const RealizationHandler = Realization.createHandler((realization) => {
  addEdge_relatedElement(realization)
})

function addEdge_relatedElement(_realization: GraphNode) {
  // TODO
  // /relatedElement : Element [1..*]{union} (opposite A_relatedElement_relationship::relationship)
  // Specifies the elements related by the Relationship.
}
