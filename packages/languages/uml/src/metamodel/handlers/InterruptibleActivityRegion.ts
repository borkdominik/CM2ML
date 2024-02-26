import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { ActivityEdge, ActivityNode, InterruptibleActivityRegion } from '../uml-metamodel'

export const InterruptibleActivityRegionHandler =
  InterruptibleActivityRegion.createHandler(
    (interruptibleActivityRegion, { onlyContainmentAssociations }) => {
      const interruptingEdges = resolveFromAttribute(interruptibleActivityRegion, 'interruptingEdge', { many: true, type: ActivityEdge })
      const nodes = resolveFromAttribute(interruptibleActivityRegion, 'node', { many: true, type: ActivityNode })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_interruptingEdge(interruptibleActivityRegion, interruptingEdges)
      addEdge_node(interruptibleActivityRegion, nodes)
    },
  )

function addEdge_interruptingEdge(interruptibleActivityRegion: GraphNode, interruptingEdges: GraphNode[]) {
  // interruptingEdge : ActivityEdge [0..*] (opposite ActivityEdge::interrupts)
  // The ActivityEdges leaving the InterruptibleActivityRegion on which a traversing token will result in the termination of other tokens flowing in the InterruptibleActivityRegion.
  interruptingEdges.forEach((interruptingEdge) => {
    interruptibleActivityRegion.model.addEdge('interruptingEdge', interruptibleActivityRegion, interruptingEdge)
  })
}

function addEdge_node(interruptibleActivityRegion: GraphNode, nodes: GraphNode[]) {
  // node : ActivityNode [0..*]{subsets ActivityGroup::containedNode} (opposite ActivityNode::inInterruptibleRegion)
  // ActivityNodes immediately contained in the InterruptibleActivityRegion.
  nodes.forEach((node) => {
    interruptibleActivityRegion.model.addEdge('node', interruptibleActivityRegion, node)
  })
}
