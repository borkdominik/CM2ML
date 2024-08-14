import type { FeatureContext } from '@cm2ml/feature-encoder'
import { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, compose, definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { pathWeightTypes, stepWeightTypes } from './bop-types'
import { validatePathParameters } from './bop-validationts'
import { encodeNode, nodeEncodings } from './node-encodings'
import type { PathData } from './paths'
import { collectPaths } from './paths'

export type { PathData } from './paths'
export { stepWeightTypes, pathWeightTypes }
export type { PathWeight, StepWeight } from './bop-types'
export { nodeEncodings }
export type { NodeEncoding, PathCounts } from './node-encodings'

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
    nodeEncoding: {
      type: 'array<string>',
      allowedValues: nodeEncodings,
      defaultValue: [nodeEncodings[0]],
      description: 'Encodings to apply to nodes',
      group: 'Paths',
    },
  },
  invoke: ({ data, metadata: featureContext }: { data: GraphModel, metadata: FeatureContext }, parameters) => {
    validatePathParameters(parameters)
    const { nodeFeatures, edgeFeatures } = featureContext
    const paths = collectPaths(data, parameters)
    const mapping = Stream
      .from(data.nodes)
      .map((node) => node.requireId())
      .toArray()
    const nodeData = Array.from(data.nodes).map((node, nodeIndex) => [node, getRelevantPaths(nodeIndex, paths)] as const)
    const longestPathLength = paths.reduce((max, path) => Math.max(max, path.steps.length), 0)
    const highestPathCount = nodeData.reduce((max, [_, paths]) => Math.max(max, paths.size), 0)
    return {
      data: {
        paths,
        mapping,
        nodes: nodeData.map(([node, paths], nodeIndex) =>
          encodeNode({
            nodeIndex,
            node,
            featureContext,
            paths,
            parameters,
            longestPathLength,
            highestPathCount,
          },
          ),
        ),
      },
      metadata: { nodeFeatures, edgeFeatures, idAttribute: data.metamodel.idAttribute, typeAttributes: data.metamodel.typeAttributes },
    }
  },
})

function getRelevantPaths(nodeIndex: number, paths: PathData[]) {
  return Stream.from(paths).filter((path) => path.steps[0] === nodeIndex || path.steps.at(-1) === nodeIndex).toSet()
}

export const BagOfPathsEncoder = compose(FeatureEncoder, batchTryCatch(PathBuilder), 'bag-of-paths')
