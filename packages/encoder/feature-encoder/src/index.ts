import type { GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'

import { deriveFeatures } from './features'

export type { FeatureMetadata, FeatureType, FeatureVector } from './features'

export const FeatureEncoder = definePlugin({
  name: 'feature-encoder',
  parameters: {
    // rawFeatures: {
    //   type: 'boolean',
    //   description: 'Do not encode features.',
    //   defaultValue: false,
    // },
  },
  batchMetadataCollector: (models: GraphModel[]) => {
    return deriveFeatures(models)
  },
  invoke(input, _parameters, features) {
    return {
      input,
      features,
    }
  },
})
