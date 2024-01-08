import type { GraphNode } from '@cm2ml/ir'

import { Enumeration, EnumerationLiteral } from '../uml-metamodel'

export const EnumerationHandler = Enumeration.createHandler(
  (enumeration, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    enumeration.children.forEach((child) => {
      addEdge_ownedLiteral(enumeration, child)
    })
  },
)

function addEdge_ownedLiteral(enumeration: GraphNode, child: GraphNode) {
  if (EnumerationLiteral.isAssignable(child)) {
    enumeration.model.addEdge('ownedLiteral', enumeration, child)
  }
}
