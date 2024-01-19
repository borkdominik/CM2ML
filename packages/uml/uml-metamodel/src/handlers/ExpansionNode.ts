import type { GraphNode } from '@cm2ml/ir'

import { ExpansionNode } from '../uml-metamodel'

export const ExpansionNodeHandler = ExpansionNode.createHandler(
  (expansionNode, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_regionAsInput(expansionNode)
    addEdge_regionAsOutput(expansionNode)
  },
)

function addEdge_regionAsInput(_expansionNode: GraphNode) {
  // TODO/Association
  // regionAsInput : ExpansionRegion [0..1] (opposite ExpansionRegion::inputElement)
  // The ExpansionRegion for which the ExpansionNode is an input.
}

function addEdge_regionAsOutput(_expansionNode: GraphNode) {
  // TODO/Association
  // regionAsOutput : ExpansionRegion [0..1] (opposite ExpansionRegion::outputElement)
  // The ExpansionRegion for which the ExpansionNode is an output.
}
