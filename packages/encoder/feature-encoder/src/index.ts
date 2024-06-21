import { GraphModel } from '@cm2ml/ir'
import { ExecutionError, ValidationError, defineStructuredBatchPlugin } from '@cm2ml/plugin'
import { ZodError } from 'zod'

import { getFeatureMetadataFromFile } from './feature-metadata-extractor'
import { FeatureMetadataSchema, deriveFeatures } from './features'

export type { FeatureName, FeatureMetadata, FeatureType, FeatureVector, FeatureContext } from './features'

export const FeatureEncoder = defineStructuredBatchPlugin({
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
      processFile: (fileContent: string) => getFeatureMetadataFromFile(fileContent, 'nodeFeatures'),
    },
    edgeFeatures: {
      type: 'string',
      description: 'Override the edge features. Must be a serialization of the feature metadata.',
      defaultValue: '',
      processFile: (fileContent: string) => getFeatureMetadataFromFile(fileContent, 'edgeFeatures'),
    },
  },
  invoke(input: (GraphModel | ExecutionError)[], parameters) {
    try {
      const models = input.filter((item) => item instanceof GraphModel)
      const nodeFeatureOverride = parameters.nodeFeatures !== '' ? FeatureMetadataSchema.parse(JSON.parse(parameters.nodeFeatures)) : null
      const edgeFeatureOverride = parameters.edgeFeatures !== '' ? FeatureMetadataSchema.parse(JSON.parse(parameters.edgeFeatures)) : null
      const features = deriveFeatures(models, { ...parameters, nodeFeatureOverride, edgeFeatureOverride })
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
