import type { FeatureContext } from '@cm2ml/feature-encoder'
import { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, compose, definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { pathWeightTypes, sortOrders, stepWeightTypes } from './bop-types'
import { encodeNode, nodeEncodingTypes } from './node-encodings'
import type { PathData } from './paths'
import { collectPaths } from './paths'

export type { PathData } from './paths'
export { stepWeightTypes, pathWeightTypes }
export type { PathWeight, StepWeight } from './bop-types'
export { nodeEncodingTypes }
export type { NodeEncodingType, NodeEncoding, PathCounts } from './node-encodings'

const PathBuilder = definePlugin({
  name: 'path-builder',
  parameters: {
    allowCycles: {
      type: 'boolean',
      defaultValue: false,
      description: 'Allow cycles in paths',
      group: 'Paths',
    },
    includeSubpaths: {
      type: 'boolean',
      defaultValue: false,
      description: 'Include subpaths, i.e., enable early termination',
      group: 'Paths',
    },
    minPathLength: {
      type: 'number',
      defaultValue: 2,
      description: 'Minimum path length',
      group: 'Filtering',
    },
    maxPathLength: {
      type: 'number',
      defaultValue: 3,
      description: 'Maximum path length',
      group: 'Filtering',
    },
    stepWeight: {
      type: 'string',
      allowedValues: stepWeightTypes,
      defaultValue: stepWeightTypes[0],
      description: 'Weighting strategy for steps',
      group: 'Weighting',
    },
    pathWeight: {
      type: 'string',
      allowedValues: pathWeightTypes,
      defaultValue: pathWeightTypes[0],
      description: 'Weighting strategy for paths',
      group: 'Weighting',
    },
    maxPaths: {
      type: 'number',
      defaultValue: 10,
      description: 'Maximum number of paths to collect',
      group: 'Filtering',
    },
    order: {
      type: 'string',
      allowedValues: sortOrders,
      defaultValue: sortOrders[1],
      description: 'Ordering of paths according to their weight',
      group: 'Filtering',
    },
    nodeEncoding: {
      type: 'list<string>',
      unique: true,
      allowedValues: nodeEncodingTypes,
      defaultValue: [],
      description: 'Encodings to apply to nodes',
      group: 'Encoding',
    },
  },
  invoke: ({ data, metadata: featureContext }: { data: GraphModel, metadata: FeatureContext }, parameters) => {
    const paths = collectPaths(data, parameters)
    const mapping = Stream
      .from(data.nodes)
      .map((node) => node.requireId())
      .toArray()
    const nodeData = Array.from(data.nodes).map((node, nodeIndex) => [node, getRelevantPaths(nodeIndex, paths)] as const)
    const longestPathLength = paths.reduce((max, path) => Math.max(max, path.steps.length), 0)
    const highestPathCount = nodeData.reduce((max, [_, paths]) => Math.max(max, paths.size), 0)
    const additionalMetadata = parameters.nodeEncoding.includes('features') ? { nodeFeatures: featureContext.nodeFeatures, edgeFeatures: featureContext.edgeFeatures } : {}
    return {
      data: {
        paths,
        mapping,
        nodes: parameters.nodeEncoding.length > 0
          ? nodeData.map(([node, paths], nodeIndex) =>
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
          )
          : undefined,
      },
      metadata: { ...additionalMetadata, idAttribute: data.metamodel.idAttribute, typeAttributes: data.metamodel.typeAttributes },
    }
  },
})

function getRelevantPaths(nodeIndex: number, paths: PathData[]) {
  return Stream.from(paths).filter((path) => path.steps[0] === nodeIndex || path.steps.at(-1) === nodeIndex).toSet()
}

export const BagOfPathsEncoder = compose(FeatureEncoder, batchTryCatch(PathBuilder), 'bag-of-paths')
