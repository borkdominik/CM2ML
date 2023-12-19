import type { GraphNode } from '@cm2ml/ir'

import { Abstraction } from '../metamodel'

export const AbstractionHandler = Abstraction.createHandler((abstraction) => {
  addEdge_mapping(abstraction)
})

function addEdge_mapping(_abstraction: GraphNode) {
  // TODO
  // mapping: OpaqueExpression[0..1]{subsets Element:: ownedElement } (opposite A_mapping_abstraction::abstraction)
}
