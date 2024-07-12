import type { DB } from 'prefixspan'
import { topK } from 'prefixspan'

import type { MiningParameters } from './bop-types'
import type { Embedding } from './embedding'

export interface MinedPattern {
  support: number
  pattern: string[]
}

export function minePatterns(embedding: Embedding, { closedPatterns, minPatternLength, maxPatternLength, maxPatternsPerPartition }: MiningParameters): MinedPattern[] {
  const db: DB = embedding
    .slice(1)
    .map((row) => row.flatMap((cell, col) => {
      if (cell === 0) {
        return []
      }
      if (cell === 1) {
        return [col]
      }
      throw new Error(`Unexpected cell value: ${cell}`)
    }))
  const patterns = topK(db, maxPatternsPerPartition, { closed: closedPatterns, minLength: minPatternLength, maxLength: maxPatternLength })
  return patterns.map(([support, pattern]) => ({ support, pattern: pattern.map((index) => embedding[0][index]!) }))
}
