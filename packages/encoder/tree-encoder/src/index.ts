import type { FeatureContext } from '@cm2ml/feature-encoder'
import { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { ExecutionError, batchTryCatch, compose, definePlugin, defineStructuredPlugin } from '@cm2ml/plugin'

import { createTree } from './tree-transformer'
import { getVocabularies } from './vocabulary'

export type * from './tree-model'

const TreeTransformer = defineStructuredPlugin({
  name: 'tree',
  parameters: {
    replaceNodeIds: {
      type: 'boolean',
      defaultValue: false,
      description: 'Replace node ids with generated ids. This keeps vocabulary size small.',
    },
  },
  invoke({ data: model, metadata }: { data: GraphModel, metadata: FeatureContext }, parameters) {
    return createTree(model, metadata, parameters.replaceNodeIds)
  },
})

const BuildVocabulary = definePlugin({
  name: 'build-vocabulary',
  parameters: {},
  invoke(input: (ReturnType<typeof createTree> | ExecutionError)[], _parameters) {
    const trees = input.filter((item): item is ReturnType<typeof createTree> => !(item instanceof ExecutionError)).map((item) => item.data)
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
