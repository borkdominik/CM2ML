import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { normalizePartition } from './normalization'
import { partitionNodes } from './partitioning'
import { restorePartitionEdges } from './restoration'

export const BagOfPathsEncoder = batchTryCatch(definePlugin({
  name: 'bag-of-paths',
  parameters: {
    maxIterations: {
      type: 'number',
      defaultValue: 10,
      description: 'The maximum number of iterations to run the algorithm for. Negative values 0 enable infinite iterations.',
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
  invoke(model: GraphModel, parameters) {
    return {
      data: Stream.from(partitionNodes(model, parameters))
        .map(restorePartitionEdges)
        .map(normalizePartition)
        .map((nodes) => [...nodes.values()])
        .map((nodes) => nodes.map(({ id }) => id))
        .toArray(),
      metadata: {},
    }
  },
}))
