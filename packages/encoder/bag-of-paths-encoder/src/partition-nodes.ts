import type { GraphModel, GraphNode } from '@cm2ml/ir'

import type { BoPParameters } from './bop-types'
import { kernighanLin } from './kernighan-lin'

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

function createPartitions(nodes: GraphNode[], parameters: BoPParameters): GraphNode[][] {
  return kernighanLin(nodes, parameters)
    .flatMap((partition) => {
      if (partition.length <= parameters.maxPartitionSize) {
        // The partition is small enough, return it as is
        return [partition]
      }
      // The partition is too large, split it recursively
      return createPartitions(partition, parameters)
    })
}
