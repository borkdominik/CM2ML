import type { FeatureContext } from '@cm2ml/feature-encoder'
import { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphModel } from '@cm2ml/ir'
import type { InferOut } from '@cm2ml/plugin'
import { ExecutionError, batchTryCatch, compose, definePlugin, defineStructuredPlugin } from '@cm2ml/plugin'

import { isValidTreeFormat, treeFormats } from './tree-model'
import { CompactTreeTransformer } from './tree-transformer/compact-tree-transformer'
import { GlobalTreeTransformer } from './tree-transformer/global-tree-transformer'
import { LocalTreeTransformer } from './tree-transformer/local-tree-transformer'
import { getVocabularies } from './vocabulary'

export type * from './tree-model'

const treeTransformers = {
  compact: CompactTreeTransformer,
  local: LocalTreeTransformer,
  global: GlobalTreeTransformer,
}

const TreeTransformer = defineStructuredPlugin({
  name: 'tree',
  parameters: {
    format: {
      type: 'string',
      defaultValue: 'local',
      allowedValues: treeFormats,
      description: 'The tree format to use.',
    },
    replaceNodeIds: {
      type: 'boolean',
      defaultValue: false,
      description: 'Replace node ids with generated ids. This keeps vocabulary size small.',
    },
  },
  invoke({ data: model, metadata: featureContext }: { data: GraphModel, metadata: FeatureContext }, parameters) {
    function createTreeModel() {
      if (!isValidTreeFormat(parameters.format)) {
        throw new Error(`Invalid tree format: ${parameters.format}.`)
      }
      const Transformer = treeTransformers[parameters.format]
      return new Transformer(model, featureContext, parameters.replaceNodeIds).treeModel
    }
    const treeModel = createTreeModel()
    return {
      data: treeModel,
      metadata: {
        nodeFeatures: featureContext.nodeFeatures,
        edgeFeatures: featureContext.edgeFeatures,
      },
    }
  },
})

const BuildVocabulary = definePlugin({
  name: 'build-vocabulary',
  parameters: {},
  invoke(input: (InferOut<typeof TreeTransformer> | ExecutionError)[], _parameters) {
    const trees = input.filter((item): item is InferOut<typeof TreeTransformer> => !(item instanceof ExecutionError)).map((item) => item.data)
    const vocabularies = getVocabularies(trees)
    return input.map((item) => {
      if (item instanceof ExecutionError) {
        return item
      }
      return {
        data: item.data,
        metadata: {
          ...item.metadata,
          vocabularies,
        },
      }
    })
  },
})

export const TreeEncoder = compose(compose(FeatureEncoder, batchTryCatch(TreeTransformer)), BuildVocabulary, TreeTransformer.name)
