import type { GraphNode } from '@cm2ml/ir'

/**
 * Add all nodes connected to the nodes in the partition to the partition.
 */
export function restorePartition(partition: Set<GraphNode>): Set<GraphNode> {
  function addConnectedNodes(node: GraphNode) {
    node.incomingEdges.forEach((edge) => partition.add(edge.source))
    node.outgoingEdges.forEach((edge) => partition.add(edge.target))
  }
  // We need to copy the partition because we can't modify it while iterating over it.
  // If we didn't, addConnectedNodes would be called with the new nodes as well.
  [...partition].forEach(addConnectedNodes)
  return partition
}
