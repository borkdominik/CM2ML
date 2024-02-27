import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Abstraction, OpaqueExpression } from '../uml-metamodel'

export const AbstractionHandler = Abstraction.createHandler(
  (abstraction, { onlyContainmentAssociations }) => {
    const mapping = resolve(abstraction, 'mapping', { type: OpaqueExpression })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_mapping(abstraction, mapping)
  },
)

function addEdge_mapping(abstraction: GraphNode, mapping: GraphNode | undefined) {
  // mapping: OpaqueExpression[0..1]{subsets Element:: ownedElement } (opposite A_mapping_abstraction::abstraction)
  // An OpaqueExpression that states the abstraction relationship.
  if (!mapping) {
    return
  }
  abstraction.model.addEdge('mapping', abstraction, mapping)
}
