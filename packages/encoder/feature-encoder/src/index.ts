import { GraphModel } from '@cm2ml/ir'
import { ExecutionError, ValidationError, defineStructuredBatchPlugin } from '@cm2ml/plugin'
import { lazy } from '@cm2ml/utils'
import { ZodError } from 'zod'

import { getFeatureMetadataFromFile } from './feature-metadata-extractor'
import { FeatureMetadataSchema, deriveFeatures } from './features'

export type { FeatureContext, FeatureMetadata, FeatureName, FeatureType, FeatureVector } from './features'

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
  invoke(input: (GraphModel | ExecutionError)[], parameters) {
    try {
      const models = input.filter((item) => item instanceof GraphModel)
      const nodeFeatureOverride = parameters.nodeFeatures !== '' ? FeatureMetadataSchema.parse(JSON.parse(parameters.nodeFeatures)) : null
      const edgeFeatureOverride = parameters.edgeFeatures !== '' ? FeatureMetadataSchema.parse(JSON.parse(parameters.edgeFeatures)) : null
      const features = lazy(() => deriveFeatures(models, { ...parameters, nodeFeatureOverride, edgeFeatureOverride }))
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
