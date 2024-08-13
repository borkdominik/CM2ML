import type { FeatureContext } from '@cm2ml/feature-encoder'
import { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, compose, definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { pathWeightTypes, stepWeightTypes } from './bop-types'
import { validatePathParameters } from './bop-validationts'
import { encodePaths, pathEncodings } from './encodings/bop-encodings'
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
    pathEncoding: {
      type: 'array<string>',
      allowedValues: pathEncodings,
      defaultValue: [pathEncodings[0]],
      description: 'Encodings to apply to paths',
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
      .map((node) => node.requireId())
      .toArray()
    const nodeToPathsMapping = nodes.map((_, nodeIndex) => Stream.from(paths).filter((path) => path.steps[0] === nodeIndex || path.steps.at(-1) === nodeIndex).toSet())
    const longestPathLength = paths.reduce((max, path) => Math.max(max, path.steps.length), 0)
    const highestPathCount = nodeToPathsMapping.reduce((max, paths) => Math.max(max, paths.size), 0)
    return {
      data: {
        paths,
        nodes,
        mapping,
        encodedPaths: nodes.map((_, nodeIndex) =>
          encodePaths(
            nodeIndex,
            nodeToPathsMapping[nodeIndex]!,
            parameters,
            longestPathLength,
            highestPathCount,
          ),
        ),
      },
      metadata: { nodeFeatures, edgeFeatures, idAttribute: data.metamodel.idAttribute, typeAttributes: data.metamodel.typeAttributes },
    }
  },
})

export const BagOfPathsEncoder = compose(FeatureEncoder, batchTryCatch(PathBuilder), 'bag-of-paths')
