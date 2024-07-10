import type { DB } from 'prefixspan'
import { topK } from 'prefixspan'

import type { Embedding } from './embedding'

export function minePatterns(embedding: Embedding, k: number) {
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
  return topK(db, k, { closed: true, minLength: 1, maxLength: 10 })
}
