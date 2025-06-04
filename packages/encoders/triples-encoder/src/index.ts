/* eslint-disable node/prefer-global/buffer */

import fs from 'node:fs'
import path from 'node:path'

import { GraphModel } from '@cm2ml/ir'
import { DEFAULT_STOP_WORDS, getMostSimilarWord } from '@cm2ml/nlp-utils'
import { defineStructuredBatchPlugin, ExecutionError } from '@cm2ml/plugin'

import { relationshipMapping, relationshipTypes, typeMapping } from './type-mapping'

export interface TriplesEncoding {
  modelId: string
  triples: Triple[]
}

export interface Triple {
  sourceName: string
  sourceType?: string | number | number[]
  sourceId?: string
  sourceEmbedding?: number[]

  relationshipType: string | number | number[]

  targetName: string
  targetType?: string | number | number[]
  targetEmbedding?: number[]
}

export interface TriplesEncoderParameters {
  // for tracability
  includeSourceId: boolean

  includeTypes: boolean
  typesAsNumber: boolean
  typesAsOneHot: boolean

  useWordEmbeddings: boolean
  embeddingsModel: string
  combineWordsStrategy: string
  oovStrategy: string
}

export const TriplesEncoder = defineStructuredBatchPlugin({
  name: 'triples',
  parameters: {
    includeSourceId: {
      type: 'boolean',
      defaultValue: true,
      description: 'Include source IDs of elements in the encoding output for traceability',
      group: 'tracability',
    },
    includeTypes: {
      type: 'boolean',
      defaultValue: false,
      description: 'Include type encodings for source and target',
      group: 'types',
    },
    typesAsNumber: {
      type: 'boolean',
      defaultValue: false,
      description: 'Encode types as a numerical value',
      group: 'types',
    },
    typesAsOneHot: {
      type: 'boolean',
      defaultValue: false,
      description: 'Encode types in form of one-hot vectors',
      group: 'types',
    },
    useWordEmbeddings: {
      type: 'boolean',
      defaultValue: false,
      description: 'Use pre-trained word embeddings for element names',
      group: 'embeddings',
    },
    embeddingsModel: {
      type: 'string',
      description: 'The pre-trained word embedding model to use.',
      helpText: 'Warning: Download of files required',
      allowedValues: ['glove', 'word2vec-google-news', 'glove-mde', 'word2vec-mde'],
      defaultValue: 'glove-mde',
      group: 'embeddings',
    },
    combineWordsStrategy: {
      type: 'string',
      defaultValue: 'average',
      allowedValues: ['average', 'first', 'concat', 'skip'],
      description: 'Strategy to combine embeddings for multi-word names',
      group: 'embeddings',
    },
    oovStrategy: {
      type: 'string',
      description: 'Strategy to handle out-of-vocabulary (OOV) terms',
      allowedValues: ['zero', 'random', 'discard', 'most-similar'],
      defaultValue: 'zero',
      group: 'embeddings',
    },
  },
  invoke(input: (GraphModel | ExecutionError)[], parameters: TriplesEncoderParameters) {
    const models = filterValidModels(input)
    if (input.length === 1 && parameters.useWordEmbeddings) {
      const newParams = { ...parameters, useWordEmbeddings: false }
      const triples = processModelTermsAsTriples(models, newParams)
      return input.map((item) => {
        if (item instanceof ExecutionError) {
          return item
        }
        return {
          data: { modelId: item.root.id },
          metadata: triples,
        }
      })
    }

    const result = processModelTermsAsTriples(models, parameters)
    return input.map((item) => {
      if (item instanceof ExecutionError) {
        return item
      }
      return {
        data: { modelId: item.root.id },
        metadata: result,
      }
    })
  },
})

function filterValidModels(input: (GraphModel | ExecutionError)[]): GraphModel[] {
  return input.filter((item) => item instanceof GraphModel)
}

function processModelTermsAsTriples(models: GraphModel[], params: TriplesEncoderParameters): TriplesEncoding[] {
  const triples: TriplesEncoding[] = []
  let embeddingsIndex: Map<string, number> | undefined
  let embeddingFilePath: string | undefined

  if (params.useWordEmbeddings) {
    const paths = getEmbeddingPaths(params.embeddingsModel)
    embeddingsIndex = loadIndex(paths.indexFilePath)
    embeddingFilePath = paths.embeddingFilePath
  }

  models.forEach((model) => {
    const modelTriples: TriplesEncoding = {
      modelId: model.root.id!,
      triples: [],
    }

    model.edges.forEach((edge) => {
      const sourceNode = model.getNodeById(edge.source.id!)
      const targetNode = model.getNodeById(edge.target.id!)
      if (!sourceNode || !targetNode) {
        return
      }

      const sourceName = sourceNode.getAttribute('name')?.value.literal
      const targetName = targetNode.getAttribute('name')?.value.literal
      if (!sourceName || !targetName) {
        return
      }

      const triple: Triple = {
        sourceName,
        relationshipType: encodeType(edge.tag, params),
        targetName,
      }

      if (params.useWordEmbeddings && embeddingsIndex && embeddingFilePath) {
        const srcEmbedding = combineWordEmbeddings(sourceName, embeddingsIndex, embeddingFilePath, params.combineWordsStrategy, params.oovStrategy)
        const tgtEmbedding = combineWordEmbeddings(targetName, embeddingsIndex, embeddingFilePath, params.combineWordsStrategy, params.oovStrategy)
        triple.sourceEmbedding = srcEmbedding ?? getFallbackEmbedding(300, params.oovStrategy)
        triple.targetEmbedding = tgtEmbedding ?? getFallbackEmbedding(300, params.oovStrategy)
      }
      if (params.includeTypes) {
        triple.sourceType = encodeType(sourceNode.type!, params)
        triple.targetType = encodeType(targetNode.type!, params)
      }
      if (params.includeSourceId) {
        triple.sourceId = edge.source.id!
      }
      modelTriples.triples.push(triple)
    })
    triples.push(modelTriples)
  })
  return triples
}

function encodeType(type: string, params: TriplesEncoderParameters): string | number | number[] {
  if (params.typesAsNumber) {
    if (relationshipTypes.includes(type)) {
      return relationshipMapping[type] ?? 0
    } else {
      return typeMapping[type] ?? 0
    }
  }

  if (params.typesAsOneHot) {
    if (relationshipTypes.includes(type)) {
      const length = Object.keys(relationshipMapping).length
      const oneHotVector: number[] = Array.from({ length }, () => 0)
      const index = relationshipMapping[type]
      if (index !== undefined) {
        oneHotVector[index - 1] = 1
      }
      return oneHotVector
    } else {
      const length = Object.keys(typeMapping).length
      const oneHotVector: number[] = Array.from({ length }, () => 0)
      const index = typeMapping[type]
      if (index !== undefined) {
        oneHotVector[index - 1] = 1
      }
      return oneHotVector
    }
  }

  return type
}

const similarWordCache: Record<string, string | null> = {}

function combineWordEmbeddings(text: string, index: Map<string, number>, embeddingFilePath: string, strategy: string, oovStrategy: string): number[] | null {
  if (!['average', 'first', 'concat', 'skip'].includes(strategy)) {
    throw new Error(`Invalid strategy for combining word embeddings: ${strategy}`)
  }

  const tokens = normalizeAndTokenize(text)
  const embeddings: number[][] = []

  for (const token of tokens) {
    let embedding = getEmbedding(token, index, embeddingFilePath).embedding

    if (!embedding && oovStrategy === 'most-similar') {
      let similar = similarWordCache[token]
      if (similar === undefined) {
        similar = getMostSimilarWord(token, index)
        similarWordCache[token] = similar ?? null
      }
      if (similar) {
        embedding = getEmbedding(similar, index, embeddingFilePath).embedding
      }
    }

    if (!embedding && oovStrategy === 'discard') {
      continue
    }
    embedding ??= getFallbackEmbedding(300, oovStrategy)
    embeddings.push(embedding)
  }

  if (embeddings.length === 0) {
    return null
  }
  if (strategy === 'skip' && tokens.length > 1) {
    return null
  }
  if (strategy === 'first') {
    return embeddings[0]!
  }
  if (strategy === 'concat') {
    return embeddings.flat()
  }

  // default to average
  const dim = embeddings[0]!.length
  const avg: number[] = Array.from({ length: dim }, () => 0)
  for (const vec of embeddings) {
    for (let i = 0; i < dim; i++) {
      avg[i]! += vec[i] ?? 0
    }
  }
  return avg.map((v) => v / embeddings.length)
}

function normalizeAndTokenize(text: string): string[] {
  // Replace digits with text equivalents (basic 0-9 mapping)
  // e.g., "123" -> "one two three"
  const digitMap: Record<string, string> = {
    '0': 'zero',
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five',
    '6': 'six',
    '7': 'seven',
    '8': 'eight',
    '9': 'nine',
  }
  text = text.replace(/\d/g, (d) => ` ${digitMap[d]} `)

  // Preserve acronyms & add space before capital letter only if not followed by another capital (lookahead)
  text = text.replace(/(?<=[a-z])([A-Z])/g, ' $1') // camelCase split
  text = text.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // acronym followed by word

  text = text.replace(/[^a-z\s\-_.]/gi, ' ')
  text = text.replace(/[\-_.]/g, ' ')

  const stopWords = new Set(DEFAULT_STOP_WORDS)

  const tokens = text
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .map((t) => t.trim())
    .filter((t) => /^[a-z]+$/.test(t))
    .filter((t) => !stopWords.has(t))

  return tokens
}

// EMBEDDINGS

// TODO: paramterize this
const EMBEDDINGS_BASE_DIR = path.join(import.meta.dirname, '../../../../embeddings/')

function getEmbeddingPaths(embeddingsModel: string) {
  const modelFileName = {
    'glove': 'glove-6B-300d.txt',
    'word2vec-google-news': 'word2vec-google-news-300.txt',
    'glove-mde': 'glove-mde.txt',
    'word2vec-mde': 'word2vec-mde.txt',
  }[embeddingsModel] ?? 'glove-mde' // Default to 'word2vec-google-news'

  const indexFileName = modelFileName.replace('.txt', '_index.txt')

  return {
    embeddingFilePath: `${EMBEDDINGS_BASE_DIR}${modelFileName}`,
    indexFilePath: `${EMBEDDINGS_BASE_DIR}${indexFileName}`,
  }
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

function getEmbedding(term: string, index: Map<string, number>, embeddingFilePath: string): { embedding: number[] | null, newTerm: string } {
  const newTerm = term
  const offset = index.get(term.toLowerCase())
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
      embedding,
      newTerm,
    }
  } catch (error) {
    console.error(`Error reading embedding for term '${term}':`, error)
    return { embedding: null, newTerm }
  }
}

function getFallbackEmbedding(dimension: number, strategy: string): number[] {
  if (strategy === 'zero') {
    return Array.from({ length: dimension }, () => 0)
  }
  if (strategy === 'random') {
    return Array.from({ length: dimension }, () => Math.random() * 2 - 1) // range [-1, 1]
  }
  return Array.from({ length: dimension }, () => 0) // default fallback
}
