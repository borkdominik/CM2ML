import type { GraphModel } from '@cm2ml/ir'
import { ValidationError, definePlugin } from '@cm2ml/plugin'
import { ZodError } from 'zod'

import { FeatureMetadataSchema, deriveFeatures } from './features'

export type { FeatureName, FeatureMetadata, FeatureType, FeatureVector } from './features'

export const FeatureEncoder = definePlugin({
  name: 'feature-encoder',
  parameters: {
    rawFeatures: {
      type: 'boolean',
      description: 'Do not encode any features.',
      defaultValue: false,
    },
    onlyEncodedFeatures: {
      type: 'boolean',
      description: 'Only emit features that are encoded.',
      defaultValue: false,
    },
    rawCategories: {
      type: 'boolean',
      description: 'Do not encode categorical features.',
      defaultValue: false,
    },
    rawBooleans: {
      type: 'boolean',
      description: 'Do not encode boolean features.',
      defaultValue: false,
    },
    rawNumerics: {
      type: 'boolean',
      description: 'Do not encode numeric features.',
      defaultValue: false,
    },
    rawStrings: {
      type: 'boolean',
      description: 'Do not encode string features.',
      defaultValue: false,
    },
    nodeFeatures: {
      type: 'string',
      description: 'Override the node features. Must be a serialization of the feature metadata.',
      defaultValue: '',
    },
    edgeFeatures: {
      type: 'string',
      description: 'Override the edge features. Must be a serialization of the feature metadata.',
      defaultValue: '',
    },
  },
  batchMetadataCollector: (models: GraphModel[], parameters) => {
    try {
      const nodeFeatureOverride = parameters.nodeFeatures !== '' ? FeatureMetadataSchema.parse(JSON.parse(parameters.nodeFeatures)) : null
      const edgeFeatureOverride = parameters.edgeFeatures !== '' ? FeatureMetadataSchema.parse(JSON.parse(parameters.edgeFeatures)) : null
      return deriveFeatures(models, { ...parameters, nodeFeatureOverride, edgeFeatureOverride })
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZodError(error)
      }
      throw error
    }
  },
  invoke(input, _parameters, features) {
    return {
      input,
      features,
    }
  },
})
