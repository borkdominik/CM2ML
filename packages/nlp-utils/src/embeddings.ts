/* eslint-disable node/prefer-global/buffer */

import fs from 'node:fs'
import path from 'node:path'

import { getMostSimilarWord } from '.'

// TODO: Reuse these functions in embeddings-related plugins (i.e., remove duplicate code)

const EMBEDDINGS_BASE_DIR = path.join(import.meta.dirname, '../../../../embeddings/')

export const SUPPORTED_MODELS: Record<string, string> = {
  'glove': 'glove-6B-300d.txt',
  'word2vec-google-news': 'word2vec-google-news-300.txt',
  'glove-mde': 'glove-mde.txt',
  'word2vec-mde': 'word2vec-mde.txt',
}

export function getEmbeddingPaths(model: string) {
  const fileName = SUPPORTED_MODELS[model] ?? SUPPORTED_MODELS['word2vec-google-news']
  const indexFileName = fileName!.replace('.txt', '_index.txt')
  return {
    embeddingFilePath: `${EMBEDDINGS_BASE_DIR}${fileName}`,
    indexFilePath: `${EMBEDDINGS_BASE_DIR}${indexFileName}`,
  }
}

export function loadIndex(indexFilePath: string): Map<string, number> {
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

export function readEmbedding(term: string, index: Map<string, number>, embeddingFilePath: string, dimension?: number): { embedding: number[] | null, newTerm: string } {
  const newTerm = term
  const offset = index.get(term.toLowerCase())
  if (offset === undefined) {
    return { embedding: null, newTerm }
  }

  try {
    const buffer = Buffer.alloc(4096)
    const fd = fs.openSync(embeddingFilePath, 'r')
    fs.readSync(fd, buffer, 0, buffer.length, offset)
    fs.closeSync(fd)

    const fullLine = buffer.toString('utf8').split('\n')[0]
    const parts = fullLine?.trim().split(/\s+/)
    if (!parts || parts.length < 2 || parts[0] !== term) {
      return { embedding: null, newTerm }
    }
    let embedding = parts.slice(1).map(Number)
    if (dimension) {
      embedding = embedding.slice(0, dimension)
    }
    return { embedding, newTerm }
  } catch (error) {
    console.error(`Error reading embedding for term '${term}':`, error)
    return { embedding: null, newTerm }
  }
}

export function getFallbackEmbedding(dimension: number, strategy: string): number[] {
  if (strategy === 'zero') {
    return Array.from({ length: dimension }, () => 0)
  }
  if (strategy === 'random') {
    return Array.from({ length: dimension }, () => Math.random() * 2 - 1)
  }
  return Array.from({ length: dimension }, () => 0)
}

export function getMostSimilarEmbedding(term: string, index: Map<string, number>, embeddingFilePath: string): { word: string, embedding: number[] } | null {
  const mostSimilarWord = getMostSimilarWord(term, index)
  if (!mostSimilarWord) {
    return null
  }
  const { embedding } = readEmbedding(mostSimilarWord, index, embeddingFilePath)
  if (!embedding) {
    return null
  }
  return { word: mostSimilarWord, embedding }
}

export function poolEmbeddings(vectors: number[][], strategy: 'mean' | 'max'): number[] {
  if (vectors.length === 0) {
    return []
  }
  const dim = vectors[0]!.length
  if (!vectors.every((vec) => vec.length === dim)) {
    return []
  }
  if (strategy === 'mean') {
    return Array.from({ length: dim }, (_, i) => vectors.reduce((sum, vec) => sum + vec[i]!, 0) / vectors.length)
  }
  if (strategy === 'max') {
    return Array.from({ length: dim }, (_, i) => Math.max(...vectors.map((vec) => vec[i]!)))
  }
  return []
}
