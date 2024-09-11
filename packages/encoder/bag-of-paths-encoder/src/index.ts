import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { pathWeightTypes, sortOrders } from './bop-types'
import { encodePaths } from './encoding'
import { collectPaths } from './paths'

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
      group: 'Filtering',
    },
    maxPathLength: {
      type: 'number',
      defaultValue: 3,
      description: 'Maximum path length',
      group: 'Filtering',
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
        paths: encodedPaths,
        mapping,
      },
      metadata: { idAttribute: data.metamodel.idAttribute, typeAttributes: data.metamodel.typeAttributes },
    }
  },
})

export const BagOfPathsEncoder = batchTryCatch(PathBuilder, 'bag-of-paths')
