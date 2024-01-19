import type { GraphNode } from '@cm2ml/ir'

import { SequenceNode } from '../uml-metamodel'

export const SequenceNodeHandler = SequenceNode.createHandler(
  (sequenceNode, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_executableNode(sequenceNode)
  },
)

function addEdge_executableNode(_sequenceNode: GraphNode) {
  // TODO/Association
  // ♦ executableNode : ExecutableNode [0..*]{ordered, redefines StructuredActivityNode::node} (opposite A_executableNode_sequenceNode::sequenceNode)
  // The ordered set of ExecutableNodes to be sequenced.
}
