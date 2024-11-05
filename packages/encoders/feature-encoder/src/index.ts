import { GraphModel } from '@cm2ml/ir'
import type { StructuredOutput } from '@cm2ml/plugin'
import { ExecutionError, ValidationError, compose, definePlugin, defineStructuredBatchPlugin, getFirstNonError } from '@cm2ml/plugin'
import { lazy } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'
import { ZodError } from 'zod'

import { getFeatureMetadataFromFile } from './feature-metadata-extractor'
import type { FeatureContext, FeatureVector, StaticFeatureData } from './features'
import { FeatureMetadataSchema, deriveFeatures } from './features'

export type { FeatureContext, FeatureMetadata, FeatureName, FeatureType, FeatureVector, StaticFeatureData } from './features'

export const FeatureEncoder = defineStructuredBatchPlugin({
  name: 'feature-encoder',
  parameters: {
    rawFeatures: {
      type: 'boolean',
      description: 'Do not encode any features.',
      defaultValue: false,
      group: 'features',
    },
    onlyEncodedFeatures: {
      type: 'boolean',
      description: 'Only emit features that are encoded.',
      defaultValue: false,
      group: 'features',
    },
    rawCategories: {
      type: 'boolean',
      description: 'Do not encode categorical features.',
      defaultValue: false,
      group: 'features',
    },
    rawBooleans: {
      type: 'boolean',
      description: 'Do not encode boolean features.',
      defaultValue: false,
      group: 'features',
    },
    rawNumerics: {
      type: 'boolean',
      description: 'Do not encode numeric features.',
      defaultValue: false,
      group: 'features',
    },
    rawStrings: {
      type: 'boolean',
      description: 'Do not encode string features.',
      defaultValue: false,
      group: 'features',
    },
    nodeFeatures: {
      type: 'string',
      description: 'Override the node features. Must be a serialization of the feature metadata.',
      defaultValue: '',
      processFile: (fileContent: string) => getFeatureMetadataFromFile(fileContent, 'nodeFeatures'),
      group: 'features',
    },
    edgeFeatures: {
      type: 'string',
      description: 'Override the edge features. Must be a serialization of the feature metadata.',
      defaultValue: '',
      processFile: (fileContent: string) => getFeatureMetadataFromFile(fileContent, 'edgeFeatures'),
      group: 'features',
    },
  },
  invoke(input: (GraphModel | ExecutionError)[], parameters): (StructuredOutput<GraphModel, FeatureContext> | ExecutionError)[] {
    try {
      const models = input.filter((item) => item instanceof GraphModel)
      const nodeFeatureOverride = parameters.nodeFeatures !== '' ? FeatureMetadataSchema.parse(JSON.parse(parameters.nodeFeatures)) : null
      const edgeFeatureOverride = parameters.edgeFeatures !== '' ? FeatureMetadataSchema.parse(JSON.parse(parameters.edgeFeatures)) : null
      const features: FeatureContext = lazy(() => deriveFeatures(models, { ...parameters, nodeFeatureOverride, edgeFeatureOverride }))
      return input.map((item) => {
        if (item instanceof ExecutionError) {
          return item
        }
        return {
          data: item,
          metadata: features,
        }
      })
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZodError(error)
      }
      throw error
    }
  },
})

export interface EncodedFeatures {
  nodes: FeatureVector[]
  edges: FeatureVector[]
}

/**
 * Encodes a graph model with feature vectors.
 */
export const StandaloneFeatureEncoder = compose(FeatureEncoder, definePlugin({
  name: 'feature-vector-generator',
  parameters: {},
  invoke(batch, _parameters): (StructuredOutput<EncodedFeatures, StaticFeatureData | undefined> | ExecutionError)[] {
    const firstNonError = getFirstNonError(batch)
    const metadata = firstNonError?.metadata.staticData
    return batch.map((item) => {
      if (item instanceof ExecutionError) {
        return item
      }
      const nodes = Stream.from(item.data.nodes).map((node) => item.metadata.getNodeFeatureVector(node)).toArray()
      const edges = Stream.from(item.data.edges).map((edge) => item.metadata.getEdgeFeatureVector(edge)).toArray()
      return {
        data: {
          nodes,
          edges,
        },
        metadata,
      }
    })
  },
}), FeatureEncoder.name)
