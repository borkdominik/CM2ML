import type { GraphNode } from '@cm2ml/ir'

export function restorePartitions(partitions: GraphNode[][]): GraphNode[][] {
  return partitions.map(restorePartition)
}

function restorePartition(partition: GraphNode[]): GraphNode[] {
  const nodes = new Set(partition)
  function addNode(node: GraphNode) {
    if (nodes.has(node)) {
      return
    }
    nodes.add(node)
  }
  function addConnectedNodes(node: GraphNode) {
    for (const edge of node.incomingEdges) {
      addNode(edge.source)
    }
    for (const edge of node.outgoingEdges) {
      addNode(edge.target)
    }
  }
  partition.forEach(addConnectedNodes)
  return [...nodes]
}
