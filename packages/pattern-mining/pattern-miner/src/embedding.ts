import type { LabeledEdge, LabeledNode } from './normalization'

export type Embedding = [LabeledEdge[], ...((0 | 1)[])[]]

export function embedPartitions(partitions: LabeledNode[][]): Embedding {
  const header = getUniqueEdges(partitions)
  const rows = partitions.map((partition) =>
    header.map((edge) => partitionHasEdge(partition, edge) ? 1 : 0),
  )
  return [header, ...rows]
}

function getUniqueEdges(partitions: LabeledNode[][]) {
  const uniqueEdges = new Map<string, LabeledEdge>()
  partitions.forEach((partition) => {
    partition.forEach((node) => {
      node.outgoingEdges.forEach((edge) => {
        if (uniqueEdges.has(edge.id)) {
          return
        }
        uniqueEdges.set(edge.id, edge)
      })
    })
  })
  return Array.from(uniqueEdges.values())
}

function partitionHasEdge(partition: LabeledNode[], labeledEdge: LabeledEdge) {
  return partition.some((node) => nodeHasEdge(node, labeledEdge))
}

function nodeHasEdge(node: LabeledNode, labeledEdge: LabeledEdge) {
  for (const edge of node.outgoingEdges) {
    if (edge.id === labeledEdge.id) {
      return true
    }
  }
  return false
}
