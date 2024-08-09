import type { FeatureContext } from '@cm2ml/feature-encoder'
import { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, compose, definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { pathWeightTypes, stepWeightTypes } from './bop-types'
import { validatePathParameters } from './bop-validationts'
import { collectPaths } from './paths'

export type { PathData } from './paths'
export { stepWeightTypes, pathWeightTypes }
export type { PathWeight, StepWeight } from './bop-types'

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
    maxPaths: {
      type: 'number',
      defaultValue: 10,
      description: 'Maximum number of paths to collect',
      group: 'Paths',
    },
  },
  invoke: ({ data, metadata: features }: { data: GraphModel, metadata: FeatureContext }, parameters) => {
    validatePathParameters(parameters)
    const { getNodeFeatureVector, nodeFeatures, edgeFeatures } = features
    const paths = collectPaths(data, parameters)
    const nodes = Stream
      .from(data.nodes)
      .map((node) => getNodeFeatureVector(node))
      .toArray()
    const mapping = Stream
      .from(data.nodes)
      .map((node) => {
        const id = node.id
        if (id === undefined) {
          throw new Error('Node ID is undefined')
        }
        return [id, node.tag] as const
      })
      .toArray()
    return {
      data: {
        paths,
        nodes,
        mapping,
      },
      metadata: { nodeFeatures, edgeFeatures, idAttribute: data.metamodel.idAttribute, typeAttributes: data.metamodel.typeAttributes },
    }
  },
})

export const BagOfPathsEncoder = compose(FeatureEncoder, batchTryCatch(PathBuilder), 'bag-of-paths')
