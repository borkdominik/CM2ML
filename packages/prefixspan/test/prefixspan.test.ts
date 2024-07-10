import { describe, expect, it } from 'vitest'

import { prefixspan } from '../src/prefixspan'

describe('prefixspan', () => {
  it('works', () => {
    const input = [
      [0, 1, 2, 3, 4],
      [1, 1, 1, 3, 4],
      [2, 1, 2, 2, 0],
      [1, 1, 1, 2, 2],
    ]
    const minsup = 2
    const result = prefixspan(input, minsup)
    result.forEach(([l, r]) => {
      // eslint-disable-next-line no-console
      console.log(`([${l.join(', ')}], [${r.join(', ')}])`)
    })
    expect(result).toEqual([
      [[0], [0, 2]],
      [[1], [0, 1, 2, 3]],
      [[1, 1], [1, 3]],
      [[1, 1, 1], [1, 3]],
      [[1, 2], [0, 2, 3]],
      [[1, 2, 2], [2, 3]],
      [[1, 3], [0, 1]],
      [[1, 3, 4], [0, 1]],
      [[1, 4], [0, 1]],
      [[2], [0, 2, 3]],
      [[2, 2], [2, 3]],
      [[3], [0, 1]],
      [[3, 4], [0, 1]],
      [[4], [0, 1]],
    ])
  })
})
