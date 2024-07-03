import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, definePlugin } from '@cm2ml/plugin'

import { partitionNodes } from './partition-nodes'

export const BagOfPathsEncoder = batchTryCatch(definePlugin({
  name: 'bag-of-paths',
  parameters: {
    maxIterations: {
      type: 'number',
      defaultValue: -1,
      description: 'The maximum number of iterations to run the algorithm for. Values smaller than 0 enable infinite iterations.',
    },
    maxPartitionSize: {
      type: 'number',
      defaultValue: 100,
      description: 'The maximum number of nodes in each partition.',
    },
  },
  invoke(model: GraphModel, parameters) {
    return {
      data: partitionNodes(model, parameters).map((nodes) => nodes.map(({ type }) => type)),
      metadata: {},
    }
  },
}))
