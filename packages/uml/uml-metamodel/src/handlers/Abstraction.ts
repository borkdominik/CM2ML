import type { GraphNode } from '@cm2ml/ir'

import { Abstraction } from '../uml-metamodel'

export const AbstractionHandler = Abstraction.createHandler(
  (abstraction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_mapping(abstraction)
  },
)

function addEdge_mapping(_abstraction: GraphNode) {
  // TODO/Association
  // mapping: OpaqueExpression[0..1]{subsets Element:: ownedElement } (opposite A_mapping_abstraction::abstraction)
}
