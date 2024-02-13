import type { GraphNode } from '@cm2ml/ir'

import { Node } from '../uml-metamodel'

export const NodeHandler = Node.createHandler(
  (node, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_nestedNode(node)
  },
)

function addEdge_nestedNode(_node: GraphNode) {
  // TODO/Association
  // ♦ nestedNode : Node [0..*]{subsets Namespace::ownedMember} (opposite A_nestedNode_node::node)
  // The Nodes that are defined (nested) within the Node.
}
