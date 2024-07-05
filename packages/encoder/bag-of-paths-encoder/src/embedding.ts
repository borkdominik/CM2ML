import type { LabeledEdge, LabeledNode } from './normalization'

function getEdgeIdentifier(edge: LabeledEdge) {
  const { source, target } = edge
  return `${source.id}>${target.id}[${edge.data.tag}]`
}

export type Embedding = [string[], ...((0 | 1)[])[]]

export function embedPartitions(partitions: LabeledNode[][]): Embedding {
  const header = createEdgeIdentifiers(partitions)
  const rows = partitions.map((partition) => {
    return header.map((identifier) => partitionHasEdge(partition, identifier) ? 1 : 0)
  })
  return [header, ...rows]
}

function createEdgeIdentifiers(partitions: LabeledNode[][]) {
  const edgeIdentifiers = new Set<string>()
  partitions.forEach((partition) => {
    partition.forEach((node) => {
      node.outgoingEdges.forEach((edge) => {
        edgeIdentifiers.add(getEdgeIdentifier(edge))
      })
    })
  })
  return [...edgeIdentifiers]
}

function partitionHasEdge(partition: LabeledNode[], edgeIdentifier: string) {
  return partition.some((node) => nodeHasEdge(node, edgeIdentifier))
}

function nodeHasEdge(node: LabeledNode, edgeIdentifier: string) {
  for (const edge of node.outgoingEdges) {
    if (getEdgeIdentifier(edge) === edgeIdentifier) {
      return true
    }
  }
  return false
}
