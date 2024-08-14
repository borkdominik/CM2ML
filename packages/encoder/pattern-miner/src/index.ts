import type { GraphModel } from '@cm2ml/ir'
import type { InferOut } from '@cm2ml/plugin'
import { ExecutionError, batchTryCatch, compose, definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { embedPartitions } from './embedding'
import { calculateFrequencies } from './frequency'
import { minePatterns } from './mining'
import { normalizePartitions } from './normalization'
import { partitionNodes } from './partitioning'
import { restorePartitionEdges } from './restoration'

export type { PatternWithFrequency } from './frequency'

const ModelPatternMiner = batchTryCatch(definePlugin({
  name: 'patterns',
  parameters: {
    maxPartitioningIterations: {
      type: 'number',
      defaultValue: 10,
      description: 'The maximum number of iterations to run the partitioning algorithm for. Negative values enable unlimited iterations.',
      group: 'partitioning',
    },
    maxPartitionSize: {
      type: 'number',
      defaultValue: 10,
      description: 'The maximum number of nodes in each partition.',
      group: 'partitioning',
    },
    costType: {
      type: 'string',
      defaultValue: 'edge-count',
      allowedValues: ['edge-count', 'constant'],
      description: 'The type of cost function to use.',
      group: 'partitioning',
    },
    maskNodeTypes: {
      type: 'boolean',
      defaultValue: false,
      description: 'Whether to mask the types of the nodes.',
      group: 'normalization',
    },
    minPatternLength: {
      type: 'number',
      defaultValue: 1,
      description: 'The minimum length of patterns to mine.',
      group: 'mining',
    },
    maxPatternLength: {
      type: 'number',
      defaultValue: 1000,
      description: 'The maximum length of patterns to mine.',
      group: 'mining',
    },
    maxPatternsPerPartition: {
      type: 'number',
      defaultValue: 10,
      description: 'The maximum number of patterns to mine.',
      group: 'mining',
    },
    closedPatterns: {
      type: 'boolean',
      defaultValue: true,
      description: 'Whether to mine closed patterns.',
      group: 'mining',
    },
  },
  invoke(model: GraphModel, parameters) {
    const partitions = partitionNodes(model, parameters)
      .map(restorePartitionEdges)
    const { normalizedPartitions, mapping } = normalizePartitions(partitions, parameters)
    const embedding = embedPartitions(normalizedPartitions)
    const patterns = minePatterns(embedding, parameters)
    return {
      data: { patterns, mapping },
      metadata: {},
    }
  },
}))

const PatternFrequencyMiner = definePlugin({
  name: 'pattern-frequency',
  parameters: {
    minAbsoluteFrequency: {
      type: 'number',
      defaultValue: 1,
      description: 'The minimum absolute frequency of a pattern to be included in the output.',
      group: 'filter',
    },
    minModelFrequency: {
      type: 'number',
      defaultValue: 1,
      description: 'The minimum frequency of a pattern in the model to be included in the output.',
      group: 'filter',
    },
    maxPatterns: {
      type: 'number',
      defaultValue: 10,
      description: 'The maximum number of patterns to include in the output.',
      group: 'filter',
    },
    patternOrder: {
      type: 'string',
      defaultValue: 'absolute-frequency',
      allowedValues: ['absolute-frequency', 'model-frequency'],
      description: 'The priority of the frequency to use when sorting patterns.',
      group: 'filter',
    },
  },
  invoke(batch: InferOut<typeof ModelPatternMiner>, parameters) {
    const patterns = Stream
      .from(batch)
      .map((result) => result instanceof ExecutionError ? [] : result.data.patterns)
    const frequencies = calculateFrequencies(patterns, parameters)
    return batch.map((input) => ({
      // Only include errors as data, because the patterns are equal for each input, thus considered metadata.
      data: input instanceof ExecutionError ? input : input.data.mapping,
      metadata: frequencies,
    }))
  },
})

export const PatternMiner = compose(ModelPatternMiner, PatternFrequencyMiner, 'pattern-miner')