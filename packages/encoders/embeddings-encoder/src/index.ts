/* eslint-disable node/prefer-global/buffer */

import fs from 'node:fs'
import path from 'node:path'

import { GraphModel } from '@cm2ml/ir'
import type { ModelTerms2 } from '@cm2ml/nlp-utils'
import { getMostSimilarWord, termExtractor, DEFAULT_STOP_WORDS } from '@cm2ml/nlp-utils'
import { defineStructuredBatchPlugin, ExecutionError } from '@cm2ml/plugin'

export interface EmbeddingsEncoding {
  modelIds: string[]
  modelEmbeddings: ModelEmbeddings[]
}

export interface ModelEmbeddings {
  modelId: string
  pooledVector?: number[] | undefined
  embeddings: WordEmbedding[]
}

// TODO: extends ExtractedTerm
export interface WordEmbedding {
  nodeId: string
  term: string
  embedding: number[]
}

export interface EmbeddingsEncoderParameters {
  // term extraction
  includeNames: boolean
  includeTypes: boolean
  includedAttributes: readonly string[]
  minTermLength: number
  maxTermLength: number
  stopWords: readonly string[]
  tokenize: boolean
  termDelimiters: readonly string[]
  lowercase: boolean
  stem: boolean
  includeNodeIds: boolean
  // embeddings-specific
  embeddingsModel: string
  dimension: number
  oovStrategy: string
  modelEncoding: boolean
  pooledModelEncoding: string
}

// TODO: parameterize this
const EMBEDDINGS_BASE_DIR = path.join(import.meta.dirname, '../../../../embeddings/')

function getEmbeddingPaths(embeddingsModel: string) {
  const modelFileName = {
    'glove': 'glove-6B-300d.txt',
    'word2vec-google-news': 'word2vec-google-news-300.txt',
    'glove-mde': 'glove-mde.txt',
    'word2vec-mde': 'word2vec-mde.txt',
  }[embeddingsModel] ?? 'word2vec-google-news' // Default to 'word2vec-google-news'

  const indexFileName = modelFileName.replace('.txt', '_index.txt')

  return {
    embeddingFilePath: `${EMBEDDINGS_BASE_DIR}${modelFileName}`,
    indexFilePath: `${EMBEDDINGS_BASE_DIR}${indexFileName}`,
  }
}

export const EmbeddingsEncoder = defineStructuredBatchPlugin({
  name: 'embeddings',
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
      description: 'List of stop words to exclude',
      group: 'filtering',
      displayName: 'Stop words',
    },
    tokenize: {
      type: 'boolean',
      defaultValue: true,
      description: 'Split and clean terms into separate tokens (controlled by term delimiters)',
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
    includeNodeIds: {
      type: 'boolean',
      defaultValue: true,
      description: 'Include node IDs in output terms',
      group: 'output',
      displayName: 'Include Node IDs',
    },
    embeddingsModel: {
      type: 'string',
      description: 'The pre-trained word embedding model to use.',
      helpText: 'Warning: Download of files required',
      allowedValues: ['glove', 'word2vec-google-news', 'glove-mde', 'word2vec-mde'],
      defaultValue: 'word2vec-google-news',
      group: 'model',
    },
    dimension: {
      type: 'number',
      description: 'The dimensionality of the embeddings.',
      defaultValue: 10,
      group: 'model',
    },
    oovStrategy: {
      type: 'string',
      description: 'The strategy to handle out-of-vocabulary (OOV) terms.',
      allowedValues: ['zero', 'random', 'discard', 'most-similar'],
      defaultValue: 'zero',
      group: 'oov',
    },
    modelEncoding: {
      type: 'boolean',
      description: 'Encode the whole model as a single vector',
      defaultValue: false,
      group: 'modelEncoding',
    },
    pooledModelEncoding: {
      type: 'string',
      description: 'The strategy to pool the embeddings of the model terms, if modelEncoding is enabled.',
      allowedValues: ['mean', 'max'],
      defaultValue: 'mean',
      group: 'modelEncoding',
    },
    embeddingsDir: {
      type: 'string',
      description: '',
      defaultValue: '',
      group: 'model',
    },
  },
  invoke(input: (GraphModel | ExecutionError)[], parameters: EmbeddingsEncoderParameters) {
    const models = filterValidModels(input)
    const modelTerms = termExtractor.invoke(models, {
      includeNames: parameters.includeNames,
      includeTypes: parameters.includeTypes,
      includedAttributes: parameters.includedAttributes,
      tokenize: parameters.tokenize,
      termDelimiters: parameters.termDelimiters,
      lowercase: parameters.lowercase,
      stem: parameters.stem,
      stopWords: parameters.stopWords,
      minTermLength: parameters.minTermLength,
      maxTermLength: parameters.maxTermLength,
      includeNodeIds: parameters.includeNodeIds,
      // TODO: implement parameter?
      separateViews: false,
    })

    // handle single input differently (for visualizer)
    if (input.length === 1) {
      return handleSingleInput(input, modelTerms, parameters)
    }

    const { embeddingFilePath, indexFilePath } = getEmbeddingPaths(parameters.embeddingsModel)
    const embeddingsIndex = loadIndex(indexFilePath)
    const processedResult = processModelTerms(modelTerms, embeddingsIndex, embeddingFilePath, parameters)

    return input.map((item) => {
      if (item instanceof ExecutionError) {
        return item
      }
      return {
        data: { modelId: item.root.id },
        metadata: processedResult,
      }
    })
  },
})

function filterValidModels(input: (GraphModel | ExecutionError)[]): GraphModel[] {
  return input.filter((item) => item instanceof GraphModel)
}

/**
 * Single input is handled differently since `node:fs` operations (e.g. readFileSync) do not work
 * in the visualizer.
 */
function handleSingleInput(input: (GraphModel | ExecutionError)[], modelTerms: ModelTerms2[], params: EmbeddingsEncoderParameters) {
  return input.map((item) => {
    if (item instanceof ExecutionError) {
      return item
    }

    const fallbackEmbedding = getFallbackEmbedding(params)
    const wordEmbeddings: WordEmbedding[] = modelTerms[0]?.terms.map((term) => ({
      nodeId: term.nodeId!,
      term: term.name,
      embedding: fallbackEmbedding,
    })) ?? []

    return {
      data: { modelId: item.root.id },
      metadata: {
        modelIds: [item.root.id],
        modelEmbeddings: [{ modelId: item.root.id, embeddings: wordEmbeddings }],
      },
    }
  })
}

function loadIndex(indexFilePath: string): Map<string, number> {
  const index: Map<string, number> = new Map()
  try {
    const data = fs.readFileSync(indexFilePath, 'utf8').split('\n')
    for (const line of data) {
      const [word, offset] = line.split(' ')
      if (word && offset) {
        index.set(word, Number(offset))
      }
    }
  } catch (error) {
    throw new Error(`Failed to load embedding index from ${indexFilePath}: ${error}`)
  }
  return index
}

function processModelTerms(modelTerms: ModelTerms2[], embeddingsIndex: Map<string, number>, embeddingFilePath: string, params: EmbeddingsEncoderParameters): EmbeddingsEncoding {
  const modelEmbeddings = modelTerms.map((model) => {
    const embeddings = model.terms.map((term) => {
      const { embedding, newTerm } = getEmbedding(term.name, embeddingsIndex, embeddingFilePath, params)
      // if (!embedding && params.oovStrategy === 'discard') return null;
      return {
        nodeId: term.nodeId!,
        term: newTerm,
        embedding: embedding ?? getFallbackEmbedding(params),
      }
    })

    let pooledEmbedding: number[] | null = null
    if (params.modelEncoding) {
      pooledEmbedding = poolEmbeddings(embeddings.map((e) => e.embedding), params.pooledModelEncoding)
    }

    return {
      modelId: model.modelId,
      embeddings,
      pooledVector: params.modelEncoding ? pooledEmbedding ?? [] : undefined,
    }
  })

  return {
    modelIds: modelTerms.map((model) => model.modelId),
    modelEmbeddings,
  }
}

function poolEmbeddings(embeddings: number[][], strategy: string): number[] {
  if (embeddings.length === 0) {
    return []
  }
  const dimension = embeddings[0]?.length
  if (!dimension) {
    return []
  }

  if (strategy === 'mean') {
    return Array.from({ length: dimension }, (_, i) => {
      return embeddings.reduce((sum, emb) => sum + (emb[i] ?? 0), 0) / embeddings.length
    })
  }

  if (strategy === 'max') {
    return Array.from({ length: dimension }, (_, i) => {
      return Math.max(...embeddings.map((emb) => emb[i] ?? -Infinity))
    })
  }

  return [] // default case (should not happen as the parameter is validated)
}

function getFallbackEmbedding(params: EmbeddingsEncoderParameters): number[] {
  if (params.oovStrategy === 'zero') {
    return Array.from({ length: params.dimension }, () => 0)
  } else if (params.oovStrategy === 'random') {
    return generateRandomEmbedding(params.dimension)
  }
  return Array.from({ length: params.dimension }, () => 0)
}

function getEmbedding(term: string, index: Map<string, number>, embeddingFilePath: string, params: EmbeddingsEncoderParameters): { embedding: number[] | null, newTerm: string } {
  let newTerm = term
  let offset = index.get(term.toLowerCase())
  if (offset === undefined && params.oovStrategy === 'most-similar') {
    const similarWord = getMostSimilarWord(term, index)
    if (similarWord) {
      offset = index.get(similarWord.toLowerCase())
      newTerm = similarWord
    }
  }
  if (offset === undefined) {
    return { embedding: null, newTerm }
  }

  try {
    const buffer = Buffer.alloc(4096) // Read in chunks for efficiency
    const fd = fs.openSync(embeddingFilePath, 'r')
    fs.readSync(fd, buffer, 0, buffer.length, offset)
    fs.closeSync(fd)

    const fullLine = buffer.toString('utf8').split('\n')[0]
    const parts = fullLine?.trim().split(' ')
    if (!parts) {
      return { embedding: null, newTerm }
    }
    const embedding = parts.slice(1).map(Number)
    return {
      embedding: embedding.length >= params.dimension ? embedding.slice(0, params.dimension) : embedding,
      newTerm,
    }
  } catch (error) {
    console.error(`Error reading embedding for term '${term}': ${error}`)
    return { embedding: null, newTerm }
  }
}

function generateRandomEmbedding(dim: number): number[] {
  return Array.from({ length: dim }, () => Math.random() * 2 - 1) // Generates values in range [-1,1]
}
