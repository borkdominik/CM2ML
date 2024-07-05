import { describe, expect, it } from 'vitest'

import { recursiveKernighanLin } from '../src'

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

describe('recursive kernighan-lin algorithm', () => {
  it('creates two partitions', () => {
    const result = recursiveKernighanLin(vertices, getConnections, { cost, maxIterations: 10, maxPartitionSize: 3 })
    expect(mapToValues(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "c",
        ],
        [
          "b",
          "f",
        ],
        [
          "d",
          "h",
        ],
        [
          "e",
          "g",
        ],
      ]
    `)
  })

  it('only runs again if required', () => {
    const result = recursiveKernighanLin(vertices, getConnections, { cost, maxIterations: 10, maxPartitionSize: 5 })
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
    const result = recursiveKernighanLin(vertices, getConnections, { cost, maxIterations: -1, maxPartitionSize: 2 })
    expect(mapToValues(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "c",
        ],
        [
          "b",
          "f",
        ],
        [
          "d",
          "h",
        ],
        [
          "e",
          "g",
        ],
      ]
    `)
  })

  describe('edge cases', () => {
    it.each([0, -1])('throws for invalid maxPartitionSize %d', (maxPartitionSize) => {
      expect(
        () => recursiveKernighanLin(
          vertices,
          getConnections,
          { cost, maxIterations: 10, maxPartitionSize },
        ),
      ).toThrowError()
    })

    it('uses the initial partitions with zero iterations', () => {
      const result = recursiveKernighanLin(vertices, getConnections, { cost, maxIterations: 0, maxPartitionSize: 2 })
      // Output is the initial partitions, as no iterations are performed
      expect(mapToValues(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "e",
        ],
        [
          "b",
          "f",
        ],
        [
          "c",
          "g",
        ],
        [
          "d",
          "h",
        ],
      ]
    `)
    })
  })
})
