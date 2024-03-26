import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { addEdge_relatedElement } from '../resolvers/relatedElement'
import { resolve } from '../resolvers/resolve'
import { transformNodeToEdgeCallback } from '../uml'
import { Include, UseCase } from '../uml-metamodel'

export const IncludeHandler = Include.createHandler(
  (include, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const addition = resolve(include, 'addition', { type: UseCase })
    const includingCase = getParentOfType(include, UseCase)
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(include, includingCase, addition)
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_addition(include, addition)
    addEdge_includingCase(include, includingCase)
    addEdge_relatedElement(include, includingCase, addition)
  },
)

function addEdge_addition(include: GraphNode, addition: GraphNode | undefined) {
  // addition : UseCase [1..1]{subsets DirectedRelationship::target} (opposite A_addition_include::include)
  // The UseCase that is to be included.
  if (!addition) {
    return
  }
  include.model.addEdge('addition', include, addition)
  include.model.addEdge('target', include, addition)
}

function addEdge_includingCase(include: GraphNode, includingCase: GraphNode | undefined) {
  // includingCase : UseCase [1..1]{subsets NamedElement::namespace, subsets DirectedRelationship::source} (opposite UseCase::include)
  // The UseCase which includes the addition and owns the Include relationship.
  if (!includingCase) {
    return
  }
  include.model.addEdge('includingCase', include, includingCase)
  include.model.addEdge('source', include, includingCase)
}
