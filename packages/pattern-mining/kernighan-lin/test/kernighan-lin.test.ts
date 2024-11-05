import { describe, expect, it } from 'vitest'

import { kernighanLin } from '../src'

import { cost, createTestGraph, getConnectedVertices as getConnections, mapToValues } from './test-utils'

const vertices = createTestGraph(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], [
  // Very strong connections between a, b, c, f
  ['a', 'b'],
  ['a', 'c'],
  ['b', 'a'],
  ['b', 'c'],
  ['b', 'f'],
  ['c', 'a'],
  ['c', 'b'],
  ['c', 'f'],
  ['f', 'a'],
  ['f', 'b'],
  ['f', 'c'],
  // Strong connections between d, e, g, h
  ['d', 'e'],
  ['d', 'g'],
  ['d', 'h'],
  ['e', 'g'],
  ['g', 'd'],
  ['g', 'e'],
  ['g', 'h'],
])

describe('kernighan-lin algorithm', () => {
  it('creates two partitions', () => {
    const result = kernighanLin(vertices, getConnections, { cost, maxIterations: 10 })
    expect(mapToValues(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "b",
          "c",
          "f",
        ],
        [
          "d",
          "e",
          "g",
          "h",
        ],
      ]
    `)
  })

  it('terminates with no iteration limit', () => {
    const result = kernighanLin(vertices, getConnections, { cost, maxIterations: -1 })
    expect(mapToValues(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "b",
          "c",
          "f",
        ],
        [
          "d",
          "e",
          "g",
          "h",
        ],
      ]
    `)
  })

  it('uses the initial partitions with zero iterations', () => {
    const result = kernighanLin(vertices, getConnections, { cost, maxIterations: 0 })
    // Output is the initial partition, as no iterations are performed
    expect(mapToValues(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "c",
          "e",
          "g",
        ],
        [
          "b",
          "d",
          "f",
          "h",
        ],
      ]
    `)
  })

  describe('edge cases', () => {
    it('can partition a single-entry list', () => {
      const vertices = createTestGraph(['a'], [])
      const result = kernighanLin(vertices, getConnections, { cost, maxIterations: -1 })
      // Output is the initial partition, as no iterations are performed
      expect(mapToValues(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
        ],
        [],
      ]
    `)
    })

    it('can partition a dual-entry list', () => {
      const vertices = createTestGraph(['a', 'b'], [['a', 'b']])
      const result = kernighanLin(vertices, getConnections, { cost, maxIterations: -1 })
      // Output is the initial partition, as no iterations are performed
      expect(mapToValues(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
        ],
        [
          "b",
        ],
      ]
    `)
    })

    it('can partition an uneven list', () => {
      const vertices = createTestGraph(['a', 'b', 'c', 'd', 'e'], [['a', 'b'], ['d', 'e']])
      const result = kernighanLin(vertices, getConnections, { cost, maxIterations: -1 })
      // Output is the initial partition, as no iterations are performed
      expect(mapToValues(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "b",
        ],
        [
          "c",
          "d",
          "e",
        ],
      ]
    `)
    })
  })
})
