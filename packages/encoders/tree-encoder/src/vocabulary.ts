import { Stream } from '@yeger/streams'

import type { RecursiveTreeNode, TreeModel, TreeNodeValue } from './tree-model'

export interface Vocabularies {
  staticVocabulary: TreeNodeValue[]
  dynamicVocabulary: TreeNodeValue[]
  vocabulary: TreeNodeValue[]
}

export function getVocabularies(trees: TreeModel<RecursiveTreeNode>[]): Vocabularies {
  const staticVocabulary = getVocabulary(trees, 'static')
  const dynamicVocabulary = getVocabulary(trees, 'dynamic')
  const vocabulary = Stream
    .from(staticVocabulary)
    .concat(dynamicVocabulary)
    .distinct()
    .toArray()
    .sort()
  return {
    staticVocabulary,
    dynamicVocabulary,
    vocabulary,
  }
}

type VocabularyType = 'static' | 'dynamic'

function getVocabulary(trees: TreeModel<RecursiveTreeNode>[], vocabularyType: VocabularyType) {
  return Stream
    .from(trees)
    .flatMap(({ root }) => getValues(root, vocabularyType))
    .distinct()
    .toArray()
    .sort()
}

function getValues(node: RecursiveTreeNode, vocabularyType: VocabularyType): Stream<TreeNodeValue> {
  const matchesVocabularyType = node.isStaticNode === (vocabularyType === 'static')
  const selfStream = matchesVocabularyType ? Stream.fromSingle(node.value) : Stream.empty<string>()
  const childStream = Stream
    .from(node.children)
    .flatMap((child) => getValues(child, vocabularyType))
  return selfStream.concat(childStream)
}
