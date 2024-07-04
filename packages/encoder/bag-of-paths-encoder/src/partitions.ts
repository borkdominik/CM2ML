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
  return createPartitions(nodes, parameters)
}

function getConnectedNodes(node: GraphNode): GraphNode[] {
  const incoming = Stream.from(node.incomingEdges).map((edge) => edge.source)
  const outgoing = Stream.from(node.outgoingEdges).map((edge) => edge.target)
  return incoming.concat(outgoing).toArray()
}

function createPartitions(nodes: GraphNode[], parameters: BoPParameters): GraphNode[][] {
  const part = kernighanLin(nodes, getConnectedNodes, parameters)
  return part.flatMap((partition) => {
    if (partition.length <= parameters.maxPartitionSize) {
      // The partition is small enough, return it as is
      return [partition]
    }
    // The partition is too large, split it recursively
    return createPartitions(partition, parameters)
  })
}
