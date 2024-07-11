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
    maxPartitioningIterations: {
      type: 'number',
      defaultValue: 10,
      description: 'The maximum number of iterations to run the partitioning algorithm for. Negative values enable unlimited iterations.',
    },
    maxPartitionSize: {
      type: 'number',
      defaultValue: 10,
      description: 'The maximum number of nodes in each partition.',
    },
    costType: {
      type: 'string',
      defaultValue: 'edge-count',
      allowedValues: ['edge-count', 'constant'],
      description: 'The type of cost function to use.',
    },
    minPatternLength: {
      type: 'number',
      defaultValue: 1,
      description: 'The minimum length of patterns to mine.',
    },
    maxPatternLength: {
      type: 'number',
      defaultValue: 1000,
      description: 'The maximum length of patterns to mine.',
    },
    maxPatterns: {
      type: 'number',
      defaultValue: 10,
      description: 'The maximum number of patterns to mine.',
    },
    closedPatterns: {
      type: 'boolean',
      defaultValue: true,
      description: 'Whether to mine closed patterns.',
    },
  },
  // TODO/Jan: Operate on entirety of batch at once?
  invoke(model: GraphModel, parameters) {
    const partitions = Stream.from(partitionNodes(model, parameters))
      .map(restorePartitionEdges)
      .map(normalizePartition)
      .toArray()
    const embedding = embedPartitions(partitions)
    const patterns = minePatterns(embedding, parameters)
    return {
      data: patterns,
      metadata: {},
    }
  },
}), name)
