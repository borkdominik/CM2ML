import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { ExpansionNode, ExpansionRegion } from '../uml-metamodel'

export const ExpansionRegionHandler = ExpansionRegion.createHandler(
  (expansionRegion, { onlyContainmentAssociations }) => {
    const inputElements = resolve(expansionRegion, 'inputElement', { many: true, type: ExpansionNode })
    const outputElements = resolve(expansionRegion, 'outputElement', { many: true, type: ExpansionNode })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_inputElement(expansionRegion, inputElements)
    addEdge_outputElement(expansionRegion, outputElements)
  },
  {
    [Uml.Attributes.mode]: 'iterative',
  },
)
function addEdge_inputElement(expansionRegion: GraphNode, inputElements: GraphNode[]) {
  // inputElement : ExpansionNode [1..*] (opposite ExpansionNode::regionAsInput)
  // The ExpansionNodes that hold the input collections for the ExpansionRegion.
  inputElements.forEach((inputElement) => {
    expansionRegion.model.addEdge('inputElement', expansionRegion, inputElement)
  })
}

function addEdge_outputElement(expansionRegion: GraphNode, outputElements: GraphNode[]) {
  // outputElement : ExpansionNode [0..*] (opposite ExpansionNode::regionAsOutput)
  // The ExpansionNodes that form the output collections of the ExpansionRegion.
  outputElements.forEach((outputElement) => {
    expansionRegion.model.addEdge('outputElement', expansionRegion, outputElement)
  })
}
