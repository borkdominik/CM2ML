import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import { kernighanLin } from 'kernighan-lin'

import type { BoPParameters } from './bop-types'

export function partitionNodes(model: GraphModel, parameters: BoPParameters): GraphNode[][] {
  const nodes = Array.from(model.nodes)
  if (parameters.maxPartitionSize <= 0) {
    throw new Error('The partition size limit must be greater than 0.')
  }
  if (parameters.maxPartitionSize === 1) {
    return nodes.map((node) => [node])
  }
  return createPartitions(model.nodes, parameters).map((partition) => Array.from(partition))
}

function getConnectedNodes(node: GraphNode): Set<GraphNode> {
  const incoming = Stream.from(node.incomingEdges).map((edge) => edge.source)
  const outgoing = Stream.from(node.outgoingEdges).map((edge) => edge.target)
  return incoming.concat(outgoing).toSet()
}

function edgeCountCost(a: GraphNode, b: GraphNode) {
  const incoming = Stream.from(a.incomingEdges).filter((edge) => edge.source === b)
  const outgoing = Stream.from(a.outgoingEdges).filter((edge) => edge.target === b)
  return incoming.concat(outgoing).toArray().length
}

function createPartitions(nodes: ReadonlySet<GraphNode>, parameters: BoPParameters): Set<GraphNode>[] {
  const cost = parameters.costType === 'edge-count' ? edgeCountCost : undefined
  const partitions = kernighanLin(nodes, getConnectedNodes, { ...parameters, cost })
  return partitions.flatMap((partition) => {
    if (partition.size <= parameters.maxPartitionSize) {
      // The partition is small enough, return it as is
      return [partition]
    }
    // The partition is too large, split it recursively
    return createPartitions(partition, parameters)
  })
}
