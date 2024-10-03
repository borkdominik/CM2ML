import type { GraphModel } from '@cm2ml/ir'
import { ExecutionError, batchTryCatch, compose, definePlugin, defineStructuredBatchPlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import type { CompiledTemplates } from './bop-types'
import { pathWeightTypes, sortOrders } from './bop-types'
import { encodePaths } from './encoding'
import { collectPaths } from './paths'
import type { PruneMethod } from './prune'
import { pruneMethods, prunePaths } from './prune'
import { compileEdgeTemplate, compileNodeTemplate, compileStepWeighting } from './templates/parser'

export type { PathWeight } from './bop-types'
export { pathWeightTypes }
export type { EncodedModelMember, EncodedPath } from './encoding'

const TemplateCompiler = defineStructuredBatchPlugin({
  name: 'template-compiler',
  parameters: {
    stepWeighting: {
      type: 'list<string>',
      unique: true,
      ordered: true,
      defaultValue: ['1'],
      description: 'Custom weighting strategies',
      group: 'Weighting',
      helpText: __GRAMMAR,
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
  invoke: (batch: (GraphModel | ExecutionError)[], parameters) => {
    const metadata: CompiledTemplates = {
      stepWeighting: parameters.stepWeighting.map(compileStepWeighting),
      nodeTemplates: parameters.nodeTemplates.map(compileNodeTemplate),
      edgeTemplates: parameters.edgeTemplates.map(compileEdgeTemplate),
    }
    return batch.map((data) => ({ data, metadata }))
  },
})

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
    minPathWeight: {
      type: 'number',
      defaultValue: 0,
      description: 'Minimum weight of paths',
      group: 'Weighting',
    },
    maxPathWeight: {
      type: 'number',
      defaultValue: Number.MAX_SAFE_INTEGER,
      description: 'Maximum weight of paths',
      group: 'Weighting',
    },
    order: {
      type: 'string',
      allowedValues: sortOrders,
      defaultValue: sortOrders[1],
      description: 'Ordering of paths according to their weight',
      group: 'Weighting',
    },
    pathWeight: {
      type: 'string',
      allowedValues: pathWeightTypes,
      defaultValue: pathWeightTypes[0],
      description: 'Weighting strategy for paths',
      group: 'Weighting',
    },
    pruneMethod: {
      type: 'string',
      allowedValues: pruneMethods,
      defaultValue: pruneMethods[0],
      description: 'Prune method for paths that are subsequences of other paths',
      helpText: `"none" performs no pruning. "node" checks if both nodes and their encodings are equal. "encoding" checks if the encoding of two nodes is equal.`,
      group: 'Paths',
    },
  },
  invoke: ({ data, metadata }: { data: GraphModel | ExecutionError, metadata: CompiledTemplates }, parameters) => {
    if (data instanceof ExecutionError) {
      return data
    }
    const rawPaths = collectPaths(data, parameters, metadata.stepWeighting)
    const encodedPaths = encodePaths(rawPaths, data, metadata)
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

export const BagOfPathsEncoder = compose(TemplateCompiler, batchTryCatch(PathBuilder), 'bag-of-paths')
