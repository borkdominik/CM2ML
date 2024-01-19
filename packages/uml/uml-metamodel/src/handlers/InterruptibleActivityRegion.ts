import type { GraphNode } from '@cm2ml/ir'

import { InterruptibleActivityRegion } from '../uml-metamodel'

export const InterruptibleActivityRegionHandler =
  InterruptibleActivityRegion.createHandler(
    (interruptibleActivityRegion, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_interruptingEdge(interruptibleActivityRegion)
      addEdge_node(interruptibleActivityRegion)
    },
  )

function addEdge_interruptingEdge(_interruptibleActivityRegion: GraphNode) {
  // TODO/Association
  // interruptingEdge : ActivityEdge [0..*] (opposite ActivityEdge::interrupts)
  // The ActivityEdges leaving the InterruptibleActivityRegion on which a traversing token will result in the termination of other tokens flowing in the InterruptibleActivityRegion.
}

function addEdge_node(_interruptibleActivityRegion: GraphNode) {
  // TODO/Association
  // node : ActivityNode [0..*]{subsets ActivityGroup::containedNode} (opposite ActivityNode::inInterruptibleRegion)
  // ActivityNodes immediately contained in the InterruptibleActivityRegion.
}
