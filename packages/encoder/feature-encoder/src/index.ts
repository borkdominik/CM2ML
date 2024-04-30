import type { GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'

import { deriveFeatures } from './features'

export type { FeatureName, FeatureMetadata, FeatureType, FeatureVector, SerializableFeatureMetadata } from './features'

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
  },
  batchMetadataCollector: (models: GraphModel[], parameters) => {
    return deriveFeatures(models, parameters)
  },
  invoke(input, _parameters, features) {
    return {
      input,
      features,
    }
  },
})
