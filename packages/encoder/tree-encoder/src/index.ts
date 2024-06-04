import type { GraphModel } from '@cm2ml/ir'
import { METADATA_KEY, compose, definePlugin } from '@cm2ml/plugin'

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
  batchMetadataCollector: (batch: TreeModel[], _parameters) => getVocabularies(batch),
  invoke(input: TreeModel, _parameters, vocabulary) {
    return {
      tree: input,
      [METADATA_KEY]: vocabulary,
    }
  },
})

export const TreeEncoder = compose(TreeTransformer, BuildVocabulary, TreeTransformer.name)
