import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType, transformNodeToEdge } from '@cm2ml/metamodel'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Include, UseCase } from '../uml-metamodel'

export const IncludeHandler = Include.createHandler(
  (include, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const addition = resolveFromAttribute(include, 'addition')
    const includingCase = getParentOfType(include, UseCase)
    if (relationshipsAsEdges) {
      // TODO/Jan: Validate direction
      transformNodeToEdge(include, includingCase, addition, 'include')
      return false
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_addition(include, addition)
    addEdge_includingCase(include, includingCase)
  },
)

function addEdge_addition(include: GraphNode, addition: GraphNode | undefined) {
  // addition : UseCase [1..1]{subsets DirectedRelationship::target} (opposite A_addition_include::include)
  // The UseCase that is to be included.
  if (!addition) {
    return
  }
  include.model.addEdge('addition', include, addition)
}

function addEdge_includingCase(include: GraphNode, includingCase: GraphNode | undefined) {
  // TODO/Association
  // includingCase : UseCase [1..1]{subsets NamedElement::namespace, subsets DirectedRelationship::source} (opposite UseCase::include)
  // The UseCase which includes the addition and owns the Include relationship.
  if (!includingCase) {
    return
  }
  include.model.addEdge('includingCase', include, includingCase)
}
