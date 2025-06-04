import { GraphModel } from '@cm2ml/ir'
import type { BiGramTermType, Term, ModelTerms2 } from '@cm2ml/nlp-utils'
import { DEFAULT_STOP_WORDS, termExtractor, extractBiGrams, biGramTermTypes, extractNGrams } from '@cm2ml/nlp-utils'
import { ExecutionError, defineStructuredBatchPlugin } from '@cm2ml/plugin'

import { createTermDocumentMatrix, createTermList } from './term-frequency'

export interface TermFrequency extends Term {
  frequency: number
}

export interface ModelTermFrequencies {
  modelId: string
  terms: TermFrequency[]
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

export interface EncoderParameters {
  includeNames: boolean
  includeTypes: boolean
  includedAttributes: readonly string[]

  minTermLength: number
  maxTermLength: number

  tokenize: boolean
  termDelimiters: readonly string[]
  lowercase: boolean
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

  // n-gram
  nGramEnabled: boolean
  nGramLength: number
  keepLowerLengthPaths: boolean
  undirected: boolean

  includeNodeIds: boolean
  separateViews: boolean
}

export const TermFrequencyEncoder = defineStructuredBatchPlugin({
  name: 'term-frequency',
  parameters: {
    includeNames: {
      type: 'boolean',
      defaultValue: true,
      description: 'Encode names as terms',
      group: 'terms',
      displayName: 'Names as terms',
    },
    includeTypes: {
      type: 'boolean',
      defaultValue: false,
      description: 'Encode types as terms',
      group: 'terms',
      displayName: 'Types as terms',
    },
    includedAttributes: {
      type: 'list<string>',
      defaultValue: [],
      description: 'Additional attributes to encode as terms',
      group: 'terms',
      displayName: 'Attributes as terms',
    },
    minTermLength: {
      type: 'number',
      defaultValue: 1,
      description: 'Minimum term length',
      group: 'filtering',
      displayName: 'Min term length',
    },
    maxTermLength: {
      type: 'number',
      defaultValue: 100,
      description: 'Maximum length of terms',
      displayName: 'Max term length',
      group: 'filtering',
    },
    stopWords: {
      type: 'list<string>',
      defaultValue: DEFAULT_STOP_WORDS,
      description: 'List of stop words to remove from the term list',
      group: 'filtering',
      displayName: 'Stop words',
    },
    tokenize: {
      type: 'boolean',
      defaultValue: true,
      description: 'Split and clean terms into separate tokens',
      group: 'normalization',
      displayName: 'Tokenize terms',
    },
    termDelimiters: {
      type: 'list<string>',
      defaultValue: [' ', '-', '_'],
      description: 'Delimiters used to split tokens',
      displayName: 'Term delimiters',
      group: 'normalization',
    },
    lowercase: {
      type: 'boolean',
      defaultValue: true,
      description: 'Convert terms to lowercase',
      group: 'normalization',
      displayName: 'Lowercase terms',
    },
    stem: {
      type: 'boolean',
      defaultValue: false,
      description: 'Apply stemming to terms',
      group: 'normalization',
      displayName: 'Stem terms',
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
    nGramEnabled: {
      type: 'boolean',
      defaultValue: false,
      description: 'Enable N-gram extraction',
      group: 'n-gram',
      displayName: 'Enable N-grams',
    },
    nGramLength: {
      type: 'number',
      defaultValue: 1,
      description: 'Length of N-gram Paths',
      group: 'n-gram',
      displayName: 'N-gram length',
    },
    keepLowerLengthPaths: {
      type: 'boolean',
      defaultValue: false,
      description: 'Keep lower length paths in N-gram extraction',
      group: 'n-gram',
      displayName: 'Keep lower length paths',
    },
    undirected: {
      type: 'boolean',
      defaultValue: false,
      description: 'Consider the graph as undirected when extracting N-gram paths',
      group: 'n-gram',
      displayName: 'Undirected',
    },
    includeNodeIds: {
      type: 'boolean',
      defaultValue: true,
      description: 'Include node IDs in output terms',
      group: 'output',
      displayName: 'Include Node IDs',
    },
    separateViews: {
      type: 'boolean',
      defaultValue: false,
      description: 'Handle each view separately',
      displayName: 'Separate Views',
      group: 'output',
    },
  },
  invoke(input: (GraphModel | ExecutionError)[], parameters: EncoderParameters) {
    const models = filterValidModels(input)
    let modelTerms: ModelTerms2[]

    if (parameters.bigramEnabled) {
      modelTerms = extractBiGrams(models, {
        bigramSeparator: parameters.bigramSeparator,
        bigramFirstTerm: parameters.bigramFirstTerm,
        bigramFirstTermAttribute: parameters.bigramFirstTermAttribute,
        bigramSecondTerm: parameters.bigramSecondTerm,
        bigramSecondTermAttribute: parameters.bigramSecondTermAttribute,
        separateViews: parameters.separateViews,
      })
    } else if (parameters.nGramEnabled) {
      modelTerms = extractNGrams(models, parameters.nGramLength, parameters.keepLowerLengthPaths, parameters.undirected, parameters.separateViews)
    } else {
      modelTerms = termExtractor.invoke(models, {
        includeNames: parameters.includeNames,
        includeTypes: parameters.includeTypes,
        includedAttributes: parameters.includedAttributes,
        minTermLength: parameters.minTermLength,
        maxTermLength: parameters.maxTermLength,
        tokenize: parameters.tokenize,
        termDelimiters: parameters.termDelimiters,
        lowercase: parameters.lowercase,
        stem: parameters.stem,
        stopWords: parameters.stopWords,
        includeNodeIds: parameters.includeNodeIds,
        separateViews: parameters.separateViews,
      })
    }

    const modelTermsFreq: ModelTermFrequencies[] = convertToTermFrequency(modelTerms)
    const termList = createTermList(modelTermsFreq, parameters)
    const termDocumentMatrix = createTermDocumentMatrix(modelTermsFreq, termList, parameters)

    return createOutput(input, termDocumentMatrix, termList, modelTermsFreq)
  },
})

function filterValidModels(input: (GraphModel | ExecutionError)[]): GraphModel[] {
  return input.filter((item) => item instanceof GraphModel)
}

function convertToTermFrequency(modelTerms: ModelTerms2[]): ModelTermFrequencies[] {
  return modelTerms.map(({ modelId, terms }) => {
    const termMap = new Map<string, TermFrequency>()
    for (const term of terms) {
      const key = term.name
      if (termMap.has(key)) {
        termMap.get(key)!.frequency++
      } else {
        termMap.set(key, { nodeId: term.nodeId ?? '', name: key, frequency: 1 })
      }
    }
    return { modelId, terms: Array.from(termMap.values()) }
  })
}

function createOutput(
  input: (GraphModel | ExecutionError)[],
  termDocumentMatrix: TermDocumentMatrix,
  termList: string[],
  modelTerms: ModelTermFrequencies[],
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
