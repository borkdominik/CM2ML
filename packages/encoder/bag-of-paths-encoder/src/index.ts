import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, definePlugin } from '@cm2ml/plugin'

import { partitionNodes } from './partitioning'
import { restorePartition } from './restoration'

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
      data: partitionNodes(model, parameters).map(restorePartition).map((nodes) => [...nodes].map(({ type }) => type)),
      metadata: {},
    }
  },
}))
