import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { ExpansionNode, ExpansionRegion } from '../uml-metamodel'

export const ExpansionNodeHandler = ExpansionNode.createHandler(
  (expansionNode, { onlyContainmentAssociations }) => {
    const regionAsInput = resolveFromAttribute(expansionNode, 'regionAsInput', { type: ExpansionRegion })
    const regionAsOutput = resolveFromAttribute(expansionNode, 'regionAsOutput', { type: ExpansionRegion })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_regionAsInput(expansionNode, regionAsInput)
    addEdge_regionAsOutput(expansionNode, regionAsOutput)
  },
)

function addEdge_regionAsInput(expansionNode: GraphNode, regionAsInput: GraphNode | undefined) {
  // TODO/Association
  // regionAsInput : ExpansionRegion [0..1] (opposite ExpansionRegion::inputElement)
  // The ExpansionRegion for which the ExpansionNode is an input.
  if (!regionAsInput) {
    return
  }
  expansionNode.model.addEdge('regionAsInput', expansionNode, regionAsInput)
}

function addEdge_regionAsOutput(expansionNode: GraphNode, regionAsOutput: GraphNode | undefined) {
  // TODO/Association
  // regionAsOutput : ExpansionRegion [0..1] (opposite ExpansionRegion::outputElement)
  // The ExpansionRegion for which the ExpansionNode is an output.
  if (!regionAsOutput) {
    return
  }
  expansionNode.model.addEdge('regionAsOutput', expansionNode, regionAsOutput)
}
