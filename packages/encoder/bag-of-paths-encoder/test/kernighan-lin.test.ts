import { describe, expect, it } from 'vitest'

import { kernighanLin } from '../src/kernighan-lin'

import { createTestModel, mapNodesToIds } from './test-utils'

const model = createTestModel(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], [
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
    const result = kernighanLin(Array.from(model.nodes), { maxIterations: 100 })
    expect(mapNodesToIds(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "b",
          "c",
          "f",
          "root",
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
    const result = kernighanLin(Array.from(model.nodes), { maxIterations: -1 })
    expect(mapNodesToIds(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "b",
          "c",
          "f",
          "root",
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
    const result = kernighanLin(Array.from(model.nodes), { maxIterations: 0 })
    // Output is the initial partition, as no iterations are performed
    expect(mapNodesToIds(result)).toMatchInlineSnapshot(`
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
          "root",
        ],
      ]
    `)
  })

  it('can partition a single-entry list', () => {
    const model = createTestModel([], [])
    const result = kernighanLin(Array.from(model.nodes), { maxIterations: -1 })
    // Output is the initial partition, as no iterations are performed
    expect(mapNodesToIds(result)).toMatchInlineSnapshot(`
      [
        [
          "root",
        ],
        [],
      ]
    `)
  })

  it('can partition a dual-entry list', () => {
    const model = createTestModel(['a'], [['root', 'a']])
    const result = kernighanLin(Array.from(model.nodes), { maxIterations: -1 })
    // Output is the initial partition, as no iterations are performed
    expect(mapNodesToIds(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
        ],
        [
          "root",
        ],
      ]
    `)
  })
})
