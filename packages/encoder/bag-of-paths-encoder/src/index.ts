import type { FeatureContext } from '@cm2ml/feature-encoder'
import { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, compose, definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { pathWeightTypes, stepWeightTypes } from './bop-types'
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
    stepWeight: {
      type: 'string',
      allowedValues: stepWeightTypes,
      defaultValue: stepWeightTypes[0],
      description: 'Weighting strategy for steps',
      group: 'Paths',
    },
    pathWeight: {
      type: 'string',
      allowedValues: pathWeightTypes,
      defaultValue: pathWeightTypes[0],
      description: 'Weighting strategy for paths',
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
