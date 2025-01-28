import { GraphModel } from '@cm2ml/ir'
import { ExecutionError, defineStructuredBatchPlugin } from '@cm2ml/plugin'

import { DEFAULT_STOP_WORDS } from './stop-words'
import type { ModelTerms } from './term-extraction'
import { extractModelTerms } from './term-extraction'
import { createTermDocumentMatrix, createTermList } from './term-frequency'

export const biGramTermTypes = ['name', 'type', 'attribute'] as const
export type BiGramTermType = typeof biGramTermTypes[number] | string & Record<never, never>

export interface EncoderParameters {
  namesAsTerms: boolean
  typesAsTerms: boolean
  attributesAsTerms: readonly string[]
  tokenize: boolean
  stem: boolean
  stopWords: readonly string[]
  normalizeTf: boolean
  tfIdf: boolean
  frequencyCutoff: number
  // bi-gram
  bigramEnabled: boolean
  bigramSeparator: string
  bigramFirstTerm: BiGramTermType
  bigramFirstTermAttribute: string
  bigramSecondTerm: BiGramTermType
  bigramSecondTermAttribute: string
}

export interface TermFrequencyEncoding {
  termDocumentMatrix: TermDocumentMatrix
  termList: string[]
  modelIds: string[]
}

/**
 * Represents a term-document matrix where model IDs are rows and term occurrences are columns
 *
 * The matrix structure is as follows:
 * |---------|-------|-------|-------|-----|
 * | modelId1|   1   |   0   |   0   | ... |
 * | modelId2|   0   |   1   |   0   | ... |
 * | modelId3|   0   |   0   |   1   | ... |
 * |   ...   |  ...  |  ...  |  ...  | ... |
 * |---------|-------|-------|-------|-----|
 *
 * The concrete terms can be retrieved from the termList in the encoding @see {@link TermFrequencyEncoding}
 */
export type TermDocumentMatrix = Record<string, number[]>

export const TermFrequencyEncoder = defineStructuredBatchPlugin({
  name: 'term-frequency',
  parameters: {
    namesAsTerms: {
      type: 'boolean',
      defaultValue: true,
      description: 'Encode names as terms',
      group: 'terms',
      displayName: 'Names as terms',
    },
    typesAsTerms: {
      type: 'boolean',
      defaultValue: false,
      description: 'Encode types as terms',
      group: 'terms',
      displayName: 'Types as terms',
    },
    attributesAsTerms: {
      type: 'array<string>',
      defaultValue: [],
      description: 'Additional attributes to encode as terms',
      group: 'terms',
      displayName: 'Attributes as terms',
    },
    tokenize: {
      type: 'boolean',
      defaultValue: false,
      description: 'Split and clean terms into separate tokens',
      group: 'term-normalization',
      displayName: 'Tokenize terms',
    },
    stem: {
      type: 'boolean',
      defaultValue: false,
      description: 'Apply stemming to terms',
      group: 'term-normalization',
      displayName: 'Stem terms',
    },
    stopWords: {
      type: 'array<string>',
      defaultValue: DEFAULT_STOP_WORDS,
      description: 'List of stop words to remove from the term list',
      group: 'term-normalization',
      displayName: 'Stop words',
    },
    normalizeTf: {
      type: 'boolean',
      defaultValue: false,
      description: 'Normalize term frequency by total number of terms in the document',
      group: 'term-frequency',
      displayName: 'Normalize TF',
    },
    tfIdf: {
      type: 'boolean',
      defaultValue: false,
      description: 'Compute Term Frequency-Inverse Document Frequency (TF-IDF) scores for terms',
      group: 'term-frequency',
      displayName: 'Compute TF-IDF',
    },
    frequencyCutoff: {
      type: 'number',
      defaultValue: 0,
      description: 'Minimum frequency for a term to be included in the matrix',
      group: 'term-frequency',
      displayName: 'Frequency Cut-off',
    },
    bigramEnabled: {
        type: 'boolean',
        defaultValue: false,
        description: 'Enable bi-gram extraction',
        group: 'bi-gram',
        displayName: 'Enable Bi-grams',
    },
    bigramSeparator: {
        type: 'string',
        defaultValue: '.',
        description: 'Separator for bi-gram terms',
        group: 'bi-gram',
        displayName: 'Bi-gram Separator',
    },
    bigramFirstTerm: {
        type: 'string',
        defaultValue: biGramTermTypes[0],
        allowedValues: biGramTermTypes,
        description: 'First term of the bi-gram',
        group: 'bi-gram',
        displayName: 'Bi-gram First Term',
    },
    bigramFirstTermAttribute: {
        type: 'string',
        defaultValue: '',
        description: 'Attribute name for the first term (if "attribute" is selected)',
        group: 'bi-gram',
        displayName: 'Bi-gram First Attribute',
    },
    bigramSecondTerm: {
        type: 'string',
        defaultValue: biGramTermTypes[1],
        allowedValues: biGramTermTypes,
        description: 'Second term of the bi-gram',
        group: 'bi-gram',
        displayName: 'Bi-gram Second Term',
    },
    bigramSecondTermAttribute: {
        type: 'string',
        defaultValue: '',
        description: 'Attribute name for the second term (if "attribute" is selected)',
        group: 'bi-gram',
        displayName: 'Bi-gram Second Attribute',
    },
  },
  invoke(input: (GraphModel | ExecutionError)[], parameters: EncoderParameters) {
    const models = filterValidModels(input)
    const modelTerms = extractModelTerms(models, parameters)
    const termList = createTermList(modelTerms, parameters)
    const termDocumentMatrix = createTermDocumentMatrix(modelTerms, termList, parameters)
    return createOutput(input, termDocumentMatrix, termList, modelTerms)
  },
})

function filterValidModels(input: (GraphModel | ExecutionError)[]): GraphModel[] {
  return input.filter((item) => item instanceof GraphModel)
}

function createOutput(
  input: (GraphModel | ExecutionError)[],
  termDocumentMatrix: TermDocumentMatrix,
  termList: string[],
  modelTerms: ModelTerms[],
) {
  const modelIds = modelTerms.map(({ modelId }) => modelId)
  const result: TermFrequencyEncoding = { termDocumentMatrix, termList, modelIds }
  return input.map((item) => {
    if (item instanceof ExecutionError) {
      return item
    }
    return {
      data: input.length === 1 ? { modelTerms } : { modelId: item.root.id },
      metadata: result,
    }
  })
}
