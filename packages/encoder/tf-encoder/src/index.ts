import { GraphModel } from '@cm2ml/ir'
import { ExecutionError, defineStructuredBatchPlugin } from '@cm2ml/plugin'
import { stemmer } from 'stemmer'

export interface ExtractedTerm {
  nodeId: string
  name: string
  occurences: number
}

export interface ModelTerms {
  modelId: string
  terms: ExtractedTerm[]
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

export interface TermFrequencyEncoding {
  termDocumentMatrix: TermDocumentMatrix
  termList: string[]
  modelIds: string[]
}

interface EncoderParameters {
  readonly namesAsTerms: boolean
  readonly typesAsTerms: boolean
  readonly attributesAsTerms: readonly string[]
  readonly tokenize: boolean
  readonly stem: boolean
  readonly stopWords: readonly string[]
  readonly normalizeTf: boolean
  readonly tfIdf: boolean
}

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
      defaultValue: [
        'a',
        'an',
        'and',
        'are',
        'as',
        'at',
        'be',
        'by',
        'for',
        'from',
        'has',
        'he',
        'in',
        'is',
        'it',
        'its',
        'of',
        'on',
        'that',
        'the',
        'to',
        'was',
        'were',
        'will',
        'with',
      ],
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
  },
  invoke(input: (GraphModel | ExecutionError)[], parameters) {
    const models = filterValidModels(input)
    const modelTerms = extractModelTerms(models, parameters)
    const termList = createTermList(modelTerms)
    const termDocumentMatrix = createTermDocumentMatrix(modelTerms, termList, parameters)
    return createOutput(input, termDocumentMatrix, termList, modelTerms)
  },
})

function filterValidModels(input: (GraphModel | ExecutionError)[]): GraphModel[] {
  return input.filter((item) => item instanceof GraphModel)
}

function extractModelTerms(models: GraphModel[], parameters: EncoderParameters): ModelTerms[] {
  return models.map((model) => {
    if (model.root.id === undefined) {
      throw new Error('Model ID is undefined')
    }
    return {
      modelId: model.root.id,
      terms: extractTerms(model, parameters),
    }
  })
}

function extractTerms(model: GraphModel, parameters: EncoderParameters): ExtractedTerm[] {
  const termMap = new Map<string, ExtractedTerm>()

  for (const node of model.nodes) {
    // process names
    const name = node.getAttribute('name')?.value.literal
    if (parameters.namesAsTerms && name) {
      processTerms(termMap, node.id!, name, parameters)
    }

    // process types (do not tokenize)
    if (parameters.typesAsTerms && node.type) {
      updateOrAddTerm(termMap, node.id!, node.type)
    }

    // process additional attributes
    for (const attr of parameters.attributesAsTerms) {
      const attrValue = node.getAttribute(attr)?.value.literal
      if (attrValue) {
        processTerms(termMap, node.id!, attrValue, parameters)
      }
    }
  }

  return Array.from(termMap.values())
}

function processTerms(termMap: Map<string, ExtractedTerm>, nodeId: string, value: string, parameters: EncoderParameters) {
  const terms = parameters.tokenize ? tokenize(value) : [value]
  const stopWords = new Set(parameters.stopWords)

  terms.forEach((term: string) => {
    const processedTerm = parameters.stem ? stemmer(term) : term
    if (!stopWords.has(processedTerm)) {
      updateOrAddTerm(termMap, nodeId, processedTerm)
    }
  })
}

function updateOrAddTerm(termMap: Map<string, ExtractedTerm>, nodeId: string, termName: string) {
  if (termMap.has(termName)) {
    const term = termMap.get(termName)!
    term.occurences++
  } else {
    termMap.set(termName, { nodeId, name: termName, occurences: 1 })
  }
}

function tokenize(text: string): string[] {
  // split text into words, considering spaces and punctuation as separators
  const rawTokens = text.split(/[\s\p{P}]+/u)
  // convert to lowercase and remove empty characters
  return rawTokens
    .map((token) => token.toLowerCase().replace(/\W+/g, ''))
    .filter((token) => token.length > 0)
}

function createTermList(modelTerms: ModelTerms[]): string[] {
  const allTerms = new Set(modelTerms.flatMap(({ terms }) => terms.map((term) => term.name)))
  return Array.from(allTerms)
}

function createTermDocumentMatrix(modelTerms: ModelTerms[], termList: string[], parameters: EncoderParameters): TermDocumentMatrix {
  const matrix: TermDocumentMatrix = {}

  modelTerms.forEach(({ modelId, terms }) => {
    const termCounts = countTerms(terms)
    const totalTerms = terms.reduce((sum, term) => sum + term.occurences, 0)

    matrix[modelId] = termList.map((term) => {
      const termCount = termCounts[term] || 0
      const tf = computeTf(termCount, totalTerms, parameters)

      if (parameters.tfIdf) {
        const idf = computeIdf(term, modelTerms)
        return computeTfIdf(tf, idf)
      }
      return tf
    })
  })
  return matrix
}

function countTerms(terms: ExtractedTerm[]): Record<string, number> {
  return terms.reduce((counts, term) => {
    counts[term.name] = term.occurences
    return counts
  }, {} as Record<string, number>)
}

// TF = term count / total number of terms in the document (if normalized)
// Note: some approaches use log(1 + TF), maybe support this too?
function computeTf(termCount: number, totalTerms: number, parameters: EncoderParameters): number {
  return parameters.normalizeTf ? termCount / totalTerms : termCount
}

// IDF = log(number of documents / number of documents containing the term)
function computeIdf(term: string, modelTerms: ModelTerms[]): number {
  const documentCount = modelTerms.length
  const documentFrequency = modelTerms.filter((model) =>
    model.terms.some((t) => t.name === term),
  ).length
  return Math.log(documentCount / (documentFrequency || 1))
}

// TF-IDF = TF * IDF
function computeTfIdf(tf: number, idf: number): number {
  return tf * idf
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
