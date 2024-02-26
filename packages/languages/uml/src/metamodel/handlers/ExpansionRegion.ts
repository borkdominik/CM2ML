import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { ExpansionNode, ExpansionRegion } from '../uml-metamodel'

export const ExpansionRegionHandler = ExpansionRegion.createHandler(
  (expansionRegion, { onlyContainmentAssociations }) => {
    const inputElement = resolve(expansionRegion, 'inputElement', { many: true, type: ExpansionNode })
    const outputElement = resolve(expansionRegion, 'outputElement', { many: true, type: ExpansionNode })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_inputElement(expansionRegion, inputElement)
    addEdge_outputElement(expansionRegion, outputElement)
  },
  {
    [Uml.Attributes.mode]: 'iterative',
  },
)
function addEdge_inputElement(expansionRegion: GraphNode, inputElement: GraphNode[]) {
  // TODO/Association
  // inputElement : ExpansionNode [1..*] (opposite ExpansionNode::regionAsInput)
  // The ExpansionNodes that hold the input collections for the ExpansionRegion.
  inputElement.forEach((inputElement) => {
    expansionRegion.model.addEdge('inputElement', expansionRegion, inputElement)
  })
}

function addEdge_outputElement(expansionRegion: GraphNode, outputElement: GraphNode[]) {
  // TODO/Association
  // outputElement : ExpansionNode [0..*] (opposite ExpansionNode::regionAsOutput)
  // The ExpansionNodes that form the output collections of the ExpansionRegion.
  outputElement.forEach((outputElement) => {
    expansionRegion.model.addEdge('outputElement', expansionRegion, outputElement)
  })
}
