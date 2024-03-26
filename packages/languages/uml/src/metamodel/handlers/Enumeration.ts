import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Enumeration, EnumerationLiteral } from '../uml-metamodel'

export const EnumerationHandler = Enumeration.createHandler(
  (enumeration, { onlyContainmentAssociations }) => {
    const ownedLiterals = resolve(enumeration, 'ownedLiteral', { many: true, type: EnumerationLiteral })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_ownedLiteral(enumeration, ownedLiterals)
  },
)

function addEdge_ownedLiteral(enumeration: GraphNode, ownedLiterals: GraphNode[]) {
  // ♦ ownedLiteral : EnumerationLiteral [0..*]{ordered, subsets Namespace::ownedMember} (opposite EnumerationLiteral::enumeration)
  // The ordered set of literals owned by this Enumeration.
  ownedLiterals.forEach((ownedLiteral) => {
    enumeration.model.addEdge('ownedLiteral', enumeration, ownedLiteral)
  })
}
