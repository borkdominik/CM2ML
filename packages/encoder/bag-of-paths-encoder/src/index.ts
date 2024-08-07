import type { FeatureContext } from '@cm2ml/feature-encoder'
import { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, compose, definePlugin } from '@cm2ml/plugin'

import { collectPaths } from './paths'

const PathBuilder = definePlugin({
  name: 'path-builder',
  parameters: {
    maxPathLength: {
      type: 'number',
      defaultValue: 5,
      description: 'Maximum path length',
      group: 'Paths',
    },
  },
  invoke: ({ data, metadata: features }: { data: GraphModel, metadata: FeatureContext }, parameters) => {
    const { nodeFeatures, edgeFeatures } = features
    const paths = collectPaths(data, parameters)
    return {
      data: paths,
      metadata: { nodeFeatures, edgeFeatures },
    }
  },
})

export const BagOfPathsEncoder = compose(FeatureEncoder, batchTryCatch(PathBuilder), 'bag-of-paths')
