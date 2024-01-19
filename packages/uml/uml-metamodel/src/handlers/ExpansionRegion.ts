import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { ExpansionRegion } from '../uml-metamodel'

export const ExpansionRegionHandler = ExpansionRegion.createHandler(
  (expansionRegion, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_inputElement(expansionRegion)
    addEdge_outputElement(expansionRegion)
  },
  {
    [Uml.Attributes.mode]: 'iterative',
  },
)
function addEdge_inputElement(_expansionRegion: GraphNode) {
  // TODO/Association
  // inputElement : ExpansionNode [1..*] (opposite ExpansionNode::regionAsInput)
  // The ExpansionNodes that hold the input collections for the ExpansionRegion.
}

function addEdge_outputElement(_expansionRegion: GraphNode) {
  // TODO/Association
  // outputElement : ExpansionNode [0..*] (opposite ExpansionNode::regionAsOutput)
  // The ExpansionNodes that form the output collections of the ExpansionRegion.
}
