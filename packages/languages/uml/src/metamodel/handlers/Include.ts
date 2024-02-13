import type { GraphNode } from '@cm2ml/ir'

import { Include } from '../uml-metamodel'

export const IncludeHandler = Include.createHandler(
  (include, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_addition(include)
    addEdge_includingCase(include)
  },
)

function addEdge_addition(_include: GraphNode) {
  // TODO/Association
  // addition : UseCase [1..1]{subsets DirectedRelationship::target} (opposite A_addition_include::include)
  // The UseCase that is to be included.
}

function addEdge_includingCase(_include: GraphNode) {
  // TODO/Association
  // includingCase : UseCase [1..1]{subsets NamedElement::namespace, subsets DirectedRelationship::source} (opposite UseCase::include)
  // The UseCase which includes the addition and owns the Include relationship.
}
