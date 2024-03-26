import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ExpansionNode, ExpansionRegion } from '../uml-metamodel'

export const ExpansionNodeHandler = ExpansionNode.createHandler(
  (expansionNode, { onlyContainmentAssociations }) => {
    const regionAsInput = resolve(expansionNode, 'regionAsInput', { type: ExpansionRegion })
    const regionAsOutput = resolve(expansionNode, 'regionAsOutput', { type: ExpansionRegion })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_regionAsInput(expansionNode, regionAsInput)
    addEdge_regionAsOutput(expansionNode, regionAsOutput)
  },
)

function addEdge_regionAsInput(expansionNode: GraphNode, regionAsInput: GraphNode | undefined) {
  // regionAsInput : ExpansionRegion [0..1] (opposite ExpansionRegion::inputElement)
  // The ExpansionRegion for which the ExpansionNode is an input.
  if (!regionAsInput) {
    return
  }
  expansionNode.model.addEdge('regionAsInput', expansionNode, regionAsInput)
}

function addEdge_regionAsOutput(expansionNode: GraphNode, regionAsOutput: GraphNode | undefined) {
  // regionAsOutput : ExpansionRegion [0..1] (opposite ExpansionRegion::outputElement)
  // The ExpansionRegion for which the ExpansionNode is an output.
  if (!regionAsOutput) {
    return
  }
  expansionNode.model.addEdge('regionAsOutput', expansionNode, regionAsOutput)
}
