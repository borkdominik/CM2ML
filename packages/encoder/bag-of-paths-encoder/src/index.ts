import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { pathWeightTypes, sortOrders } from './bop-types'
import { encodePaths } from './encoding'
import { collectPaths } from './paths'
import type { PruneMethod } from './prune'
import { pruneMethods, prunePaths } from './prune'

export type { PathWeight } from './bop-types'
export { pathWeightTypes }
export type { EncodedModelMember, EncodedPath } from './encoding'

const PathBuilder = definePlugin({
  name: 'path-builder',
  parameters: {
    allowCycles: {
      type: 'boolean',
      defaultValue: false,
      description: 'Allow cycles in paths',
      group: 'Paths',
    },
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
    maxPaths: {
      type: 'number',
      defaultValue: 10,
      description: 'Maximum number of paths to collect',
      group: 'Paths',
    },
    pruneMethod: {
      type: 'string',
      allowedValues: pruneMethods,
      defaultValue: pruneMethods[0],
      description: 'Prune method for paths that are subsequences of other paths',
      helpText: `"none" performs no pruning. "node" checks if both nodes and their encodings are equal. "encoding" checks if the encoding of two nodes is equal.`,
      group: 'Paths',
    },
    order: {
      type: 'string',
      allowedValues: sortOrders,
      defaultValue: sortOrders[1],
      description: 'Ordering of paths according to their weight',
      group: 'Weighting',
    },
    stepWeighting: {
      type: 'list<string>',
      unique: true,
      ordered: true,
      defaultValue: ['1'],
      description: 'Custom weighting strategies',
      group: 'Weighting',
      helpText: __GRAMMAR,
    },
    pathWeight: {
      type: 'string',
      allowedValues: pathWeightTypes,
      defaultValue: pathWeightTypes[0],
      description: 'Weighting strategy for paths',
      group: 'Weighting',
    },
    nodeTemplates: {
      type: 'list<string>',
      unique: true,
      ordered: true,
      defaultValue: ['{{name}}.{{type}}'],
      description: 'Template for encoding nodes of paths',
      group: 'Encoding',
      helpText: __GRAMMAR,
    },
    edgeTemplates: {
      type: 'list<string>',
      unique: true,
      ordered: true,
      defaultValue: ['{{tag}}'],
      description: 'Template for encoding edges of paths',
      group: 'Encoding',
      helpText: __GRAMMAR,
    },
  },
  invoke: (data: GraphModel, parameters) => {
    const rawPaths = collectPaths(data, parameters)
    const encodedPaths = encodePaths(rawPaths, data, parameters)
    const mapping = Stream
      .from(data.nodes)
      .map((node) => node.requireId())
      .toArray()
    return {
      data: {
        paths: prunePaths(encodedPaths, parameters.pruneMethod as PruneMethod),
        mapping,
      },
      metadata: { idAttribute: data.metamodel.idAttribute, typeAttributes: data.metamodel.typeAttributes },
    }
  },
})

export const BagOfPathsEncoder = batchTryCatch(PathBuilder, 'bag-of-paths')
