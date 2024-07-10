import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { embedPartitions } from './embedding'
import { minePatterns } from './mining'
import { normalizePartition } from './normalization'
import { partitionNodes } from './partitioning'
import { restorePartitionEdges } from './restoration'

export type { Embedding } from './embedding'

const name = 'bag-of-paths'

export const BagOfPathsEncoder = batchTryCatch(definePlugin({
  name,
  parameters: {
    maxIterations: {
      type: 'number',
      defaultValue: 10,
      description: 'The maximum number of iterations to run the algorithm for. Negative values enable unlimited iterations.',
    },
    maxPartitionSize: {
      type: 'number',
      defaultValue: 100,
      description: 'The maximum number of nodes in each partition.',
    },
    costType: {
      type: 'string',
      defaultValue: 'edge-count',
      allowedValues: ['edge-count', 'constant'],
      description: 'The type of cost function to use.',
    },
  },
  // TODO/Jan: Operate on entirety of batch at once?
  invoke(model: GraphModel, parameters) {
    const partitions = Stream.from(partitionNodes(model, parameters))
      .map(restorePartitionEdges)
      .map(normalizePartition)
      .toArray()
    const embedding = embedPartitions(partitions)
    const k = 10 // TODO/Jan: Make param
    const patterns = minePatterns(embedding, k)
    return {
      data: patterns,
      metadata: {},
    }
  },
}), name)
