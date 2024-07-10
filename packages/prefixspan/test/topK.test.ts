import { describe, expect, it } from 'vitest'

import { topK } from '../src'
import { compareNestedArrays, invertedIndex, sortOccurs, sortResults } from '../src/topK'
import type { Matches, Occurs, Pattern } from '../src/types'

describe('topK', () => {
  it('works', () => {
    const input = [
      [0, 1, 2, 3, 4],
      [1, 1, 1, 3, 4],
      [2, 1, 2, 2, 0],
      [1, 1, 1, 2, 2],
    ]
    const k = 7
    const result = topK(input, k, { closed: true, minLength: 1, maxLength: 1000 })
    expect(result).toEqual([
      [4, [1]],
      [3, [1, 2]],
      [2, [0]],
      [2, [1, 1, 1]],
      [2, [1, 2, 2]],
      [2, [1, 3, 4]],
      [1, [1, 1, 1, 3, 4]],
    ])
  })

  describe('inverted index', () => {
    it('is created correctly', () => {
      const sequences = [[2, 3, 4], [1, 1, 3, 4], [2, 2, 0], [1, 1, 2, 2]]
      const index = invertedIndex(sequences, [[0, 1], [1, 0], [2, 1], [3, 0]])
      expect(index).toMatchObject({
        '0': [[2, 4]],
        '1': [[1, 1], [3, 1]],
        '2': [[0, 2], [2, 2], [3, 3]],
        '3': [[0, 3], [1, 3]],
        '4': [[0, 4], [1, 4]],
      })
    })
  })

  describe('sorting', () => {
    it.each([
      [[0], [], false],
      [[0], [1], true],
      [[3, 0], [1], false],
      [[0, 0], [0, 1], true],
      [[0, 0], [0], false],
      [[0, [0]], [0, [1]], true],
      [[0, [0, 2]], [0, [0, 1]], false],
      [[1, [0, 3], [[0, 1]]], [1, [0, 2, 2], [[0, 0]]], false],
      [[2, [0], [[0, 0], [2, 4]]], [1, [1, 1, 1, 2, 2], [[3, 4]]], false],
    ])('compareNestedArrays works for %s, %s -> %s', (a, b, target) => {
      expect(compareNestedArrays(a, b)).toEqual(target ? -1 : 1)
      expect(compareNestedArrays(b, a)).toEqual(target ? 1 : -1)
    })

    it('sorts occurrences', () => {
      const occurs: Occurs = {
        '0': [[2, 4]],
        '1': [[1, 1], [3, 1]],
        '2': [[0, 2], [2, 2], [3, 3]],
        '3': [[0, 3], [1, 3]],
        '4': [[0, 4], [1, 4]],
      }
      const result = sortOccurs(occurs, [1], (_, matches) => matches.length)
      expect(result).toEqual([
        [2, [[0, 2], [2, 2], [3, 3]]],
        [3, [[0, 3], [1, 3]]],
        [4, [[0, 4], [1, 4]]],
        [1, [[1, 1], [3, 1]]],
        [0, [[2, 4]]],
      ])
    })

    it('sorts results', () => {
      const results: [number, Pattern, Matches][] = [
        [1, [0, 1, 2, 3, 4], [[0, 4]]],
        [
          1,
          [1, 1, 1, 2, 2],
          [[3, 4]],
        ],
        [
          1,
          [1, 1, 1, 3, 4],
          [[1, 4]],
        ],
        [
          2,
          [0],
          [[0, 0], [2, 4]],
        ],
        [
          1,
          [2, 1, 2, 2, 0],
          [[2, 4]],
        ],
        [
          3,
          [1, 2],
          [[0, 2], [2, 2], [3, 3]],
        ],
        [
          2,
          [1, 1, 1],
          [[1, 2], [3, 2]],
        ],
        [
          4,
          [1],
          [[0, 1], [1, 0], [2, 1], [3, 0]],
        ],
        [
          2,
          [1, 2, 2],
          [[2, 3], [3, 4]],
        ],
        [
          2,
          [1, 3, 4],
          [[0, 4], [1, 4]],
        ],
      ]
      const sorted = sortResults(results).map((r) => [r[0], r[1]])
      expect(sorted).toEqual([
        [4, [1]],
        [3, [1, 2]],
        [2, [0]],
        [2, [1, 1, 1]],
        [2, [1, 2, 2]],
        [2, [1, 3, 4]],
        [1, [0, 1, 2, 3, 4]],
        [1, [1, 1, 1, 2, 2]],
        [1, [1, 1, 1, 3, 4]],
        [1, [2, 1, 2, 2, 0]],
      ])
    })
  })
})
