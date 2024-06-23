import type { FeatureContext } from '@cm2ml/feature-encoder'
import { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphModel } from '@cm2ml/ir'
import type { InferOut } from '@cm2ml/plugin'
import { ExecutionError, batchTryCatch, compose, definePlugin, defineStructuredPlugin } from '@cm2ml/plugin'

import type { RecursiveTreeNode, TreeNodeValue } from './tree-model'
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

const WordsToIds = definePlugin({
  name: 'words-to-ids',
  parameters: {
    wordsToIds: {
      type: 'boolean',
      defaultValue: false,
      description: 'Whether to convert words to ids.',
    },
    idStartIndex: {
      type: 'number',
      defaultValue: 0,
      description: 'The start index for the ids.',
    },
  },
  invoke(input: (InferOut<typeof BuildVocabulary>), parameters) {
    if (!parameters.wordsToIds) {
      return input
    }
    const firstValidInput = input.find((item): item is Exclude<InferOut<typeof BuildVocabulary>[number], ExecutionError> => !(item instanceof ExecutionError))
    if (!firstValidInput) {
      return input
    }
    const metadata = firstValidInput.metadata
    const wordIdMapping: Record<TreeNodeValue, number> = {}
    metadata.vocabularies.vocabulary.forEach((word, index) => {
      wordIdMapping[word] = index + parameters.idStartIndex
    })
    function mapNode(node: RecursiveTreeNode): RecursiveTreeNode {
      const newValue = wordIdMapping[node.value]
      if (newValue === undefined) {
        throw new Error(`Word not found in vocabulary: ${node.value}. This is an internal error.`)
      }
      return {
        ...node,
        value: newValue,
        children: node.children.map(mapNode),
      }
    }
    return input.map((item) => {
      if (item instanceof ExecutionError) {
        return item
      }
      const treeModel = item.data
      return {
        data: {
          ...treeModel,
          root: mapNode(treeModel.root),
        },
        metadata: item.metadata,
      }
    })
  },
})

export const TreeEncoder = compose(
  compose(FeatureEncoder, batchTryCatch(TreeTransformer)),
  compose(BuildVocabulary, WordsToIds),
  TreeTransformer.name,
)
