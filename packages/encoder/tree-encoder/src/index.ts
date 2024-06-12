import type { GraphModel } from '@cm2ml/ir'
import { ExecutionError, batchTryCatch, compose, definePlugin } from '@cm2ml/plugin'

import type { TreeModel } from './tree-model'
import { createTree } from './tree-transformer'
import { getVocabularies } from './vocabulary'

export type * from './tree-model'

const TreeTransformer = definePlugin({
  name: 'tree',
  parameters: {},
  invoke(input: GraphModel, _parameters) {
    return createTree(input)
  },
})

const BuildVocabulary = definePlugin({
  name: 'build-vocabulary',
  parameters: {},
  invoke(input: (TreeModel | ExecutionError)[], _parameters) {
    const trees = input.filter((item): item is TreeModel => !(item instanceof ExecutionError))
    const vocabularies = getVocabularies(trees)
    return input.map((item) => {
      if (item instanceof ExecutionError) {
        return item
      }
      return {
        data: item,
        metadata: vocabularies,
      }
    })
  },
})

export const TreeEncoder = compose(batchTryCatch(TreeTransformer), BuildVocabulary, TreeTransformer.name)
