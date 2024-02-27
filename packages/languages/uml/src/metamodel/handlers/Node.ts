import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Node } from '../uml-metamodel'

export const NodeHandler = Node.createHandler(
  (node, { onlyContainmentAssociations }) => {
    const nestedNodes = resolve(node, 'nestedNode', { many: true, type: Node })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_nestedNode(node, nestedNodes)
  },
)

function addEdge_nestedNode(node: GraphNode, nestedNodes: GraphNode[]) {
  // ♦ nestedNode : Node [0..*]{subsets Namespace::ownedMember} (opposite A_nestedNode_node::node)
  // The Nodes that are defined (nested) within the Node.
  nestedNodes.forEach((nestedNode) => {
    node.model.addEdge('nestedNode', node, nestedNode)
  })
}
