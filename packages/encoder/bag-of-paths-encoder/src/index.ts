import type { FeatureContext } from '@cm2ml/feature-encoder'
import { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, compose, definePlugin } from '@cm2ml/plugin'

const PathBuilder = definePlugin({
  name: 'path-builder',
  parameters: {},
  invoke: ({ metadata: features }: { data: GraphModel, metadata: FeatureContext }, _parameters) => {
    const { nodeFeatures, edgeFeatures } = features
    return {
      data: ['TODO'],
      metadata: { nodeFeatures, edgeFeatures },
    }
  },
})

export const BagOfPathsEncoder = compose(FeatureEncoder, batchTryCatch(PathBuilder), 'bag-of-paths')
