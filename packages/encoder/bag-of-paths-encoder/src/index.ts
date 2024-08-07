import type { FeatureContext } from '@cm2ml/feature-encoder'
import { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, compose, definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { weightReductions, weights } from './bop-types'
import { collectPaths } from './paths'

const PathBuilder = definePlugin({
  name: 'path-builder',
  parameters: {
    minPathLength: {
      type: 'number',
      defaultValue: 2,
      description: 'Minimum path length',
      group: 'Paths',
    },
    maxPathLength: {
      type: 'number',
      defaultValue: 3,
      description: 'Maximum path length',
      group: 'Paths',
    },
    weight: {
      type: 'string',
      allowedValues: weights,
      defaultValue: weights[0],
      description: 'Weighting strategy for steps',
      group: 'Paths',
    },
    weightReduction: {
      type: 'string',
      allowedValues: weightReductions,
      defaultValue: weightReductions[0],
      description: 'Reduction strategy for step weights',
      group: 'Paths',
    },
  },
  invoke: ({ data, metadata: features }: { data: GraphModel, metadata: FeatureContext }, parameters) => {
    const { getNodeFeatureVector, nodeFeatures, edgeFeatures } = features
    const paths = collectPaths(data, parameters)
    const nodes = Stream.from(data.nodes).map((node) => getNodeFeatureVector(node)).toArray()
    return {
      data: {
        paths,
        nodes,
      },
      metadata: { nodeFeatures, edgeFeatures },
    }
  },
})

export const BagOfPathsEncoder = compose(FeatureEncoder, batchTryCatch(PathBuilder), 'bag-of-paths')
