import type { FeatureContext, StaticFeatureData } from '@cm2ml/feature-encoder'
import { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphModel } from '@cm2ml/ir'
import type { InferOut, StructuredOutput } from '@cm2ml/plugin'
import { ExecutionError, batchTryCatch, compose, definePlugin, defineStructuredPlugin, getFirstNonError } from '@cm2ml/plugin'

import { CompactTreeBuilder } from './tree-builder/compact-tree-builder'
import { GlobalTreeBuilder } from './tree-builder/global-tree-builder'
import { LocalTreeBuilder } from './tree-builder/local-tree-builder'
import { isValidTreeFormat, treeFormats } from './tree-model'
import type { RecursiveTreeNode, TreeModel, TreeNodeValue } from './tree-model'
import type { Vocabularies } from './vocabulary'
import { getVocabularies } from './vocabulary'

export type * from './tree-model'
export { type Vocabularies } from './vocabulary'

export type TreeBasedData = TreeModel<RecursiveTreeNode>

const treeBuilders = {
  compact: CompactTreeBuilder,
  local: LocalTreeBuilder,
  global: GlobalTreeBuilder,
}

const TreeTransformer = defineStructuredPlugin({
  name: 'tree',
  parameters: {
    format: {
      type: 'string',
      defaultValue: 'local',
      allowedValues: treeFormats,
      description: 'The tree format to use.',
      group: 'tree',
    },
    replaceNodeIds: {
      type: 'boolean',
      defaultValue: false,
      description: 'Replace node ids with generated ids. This keeps vocabulary size small.',
      group: 'vocabulary',
    },
    verboseFeatureValues: {
      type: 'boolean',
      defaultValue: false,
      description: 'Add name and type prefixes to feature values. This makes values unique across features.',
      group: 'vocabulary',
    },
  },
  invoke({ data: model, metadata: featureContext }: { data: GraphModel, metadata: FeatureContext }, parameters): StructuredOutput<TreeBasedData, StaticFeatureData> {
    function createTreeModel(): TreeBasedData {
      if (!isValidTreeFormat(parameters.format)) {
        throw new Error(`Invalid tree format: ${parameters.format}.`)
      }
      const Transformer = treeBuilders[parameters.format]
      return new Transformer(model, featureContext, parameters).treeModel
    }
    const treeModel = createTreeModel()
    return {
      data: treeModel,
      metadata: featureContext.staticData,
    }
  },
})

interface VocabularyMetadata extends Partial<StaticFeatureData> {
  vocabularies: Vocabularies
}

const BuildVocabulary = definePlugin({
  name: 'build-vocabulary',
  parameters: {},
  invoke(input: (InferOut<typeof TreeTransformer> | ExecutionError)[], _parameters): (StructuredOutput<TreeBasedData, VocabularyMetadata> | ExecutionError)[] {
    const trees = input.filter((item): item is InferOut<typeof TreeTransformer> => !(item instanceof ExecutionError)).map((item) => item.data)
    const vocabularies = getVocabularies(trees)
    const newMetadata: VocabularyMetadata = {
      ...(getFirstNonError(input)?.metadata ?? {}),
      vocabularies,
    }
    return input.map((item) => {
      if (item instanceof ExecutionError) {
        return item
      }
      return {
        data: item.data,
        metadata: newMetadata,
      }
    })
  },
})

export type Id2WordMapping = Record<`${number}`, TreeNodeValue>

export type Word2IdMapping = Record<TreeNodeValue, number>

type BuildVocabularyOutput = InferOut<typeof BuildVocabulary>

export type TreeBasedMetadata = VocabularyMetadata & { id2WordMapping: Id2WordMapping }

const WordsToIds = definePlugin({
  name: 'words-to-ids',
  parameters: {
    wordsToIds: {
      type: 'boolean',
      defaultValue: false,
      description: 'Whether to convert words to ids.',
      group: 'vocabulary',
    },
    idStartIndex: {
      type: 'number',
      defaultValue: 0,
      description: 'The start index for the ids. Has no effect if wordsToIds is false.',
      group: 'vocabulary',
    },
  },
  invoke(input: BuildVocabularyOutput, parameters): (StructuredOutput<TreeBasedData, TreeBasedMetadata> | ExecutionError)[] {
    function alignOutType() {
      let metadata: TreeBasedMetadata | null = null
      return input.map((item) => {
        if (item instanceof ExecutionError) {
          return item
        }
        const treeModel = item.data
        if (!metadata) {
          metadata = { ...item.metadata, id2WordMapping: [] }
        }
        return {
          data: treeModel,
          metadata,
        }
      })
    }
    if (!parameters.wordsToIds) {
      return alignOutType()
    }
    const firstValidInput = getFirstNonError(input)
    if (!firstValidInput) {
      return alignOutType()
    }
    const metadata = firstValidInput.metadata
    const word2IdMapping: Word2IdMapping = {}
    metadata.vocabularies.vocabulary.forEach((word, index) => {
      word2IdMapping[word] = index + parameters.idStartIndex
    })
    const id2WordMapping: Id2WordMapping = {}
    function mapNode(node: RecursiveTreeNode): RecursiveTreeNode {
      const wordId = word2IdMapping[node.value]
      if (wordId === undefined) {
        throw new Error(`Word not found in vocabulary: ${node.value}. This is an internal error.`)
      }
      id2WordMapping[`${wordId}`] = node.value
      return {
        ...node,
        value: wordId,
        children: node.children.map(mapNode),
      }
    }
    const newMetadata: TreeBasedMetadata = {
      ...firstValidInput.metadata,
      id2WordMapping,
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
        metadata: newMetadata,
      }
    })
  },
})

/**
 * Encodes a graph model as a tree.
 *
 * **Requirements:**
 * - Each node must have a unique id.
 * - Each node must have a type (`global` format only).
 */
export const TreeEncoder = compose(
  compose(FeatureEncoder, batchTryCatch(TreeTransformer)),
  compose(BuildVocabulary, WordsToIds),
  TreeTransformer.name,
)
