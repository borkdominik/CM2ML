import { describe, expect, it } from 'vitest'

import { partitionNodes } from '../src/partitioning'

import { createTestModel, mapNodesToIds } from './test-utils'

const model = createTestModel(['a', 'b', 'c', 'd', 'e', 'f'], [
  // Connections between root and a
  ['root', 'a'],
  ['a', 'root'],
  ['a', 'root'],
  // Connections between b and d
  ['b', 'd'],
  ['d', 'b'],
  // Connections between c and e
  ['c', 'e'],
  ['e', 'c'],
])

describe('partitioning', () => {
  it('creates balances partitions', () => {
    const result = partitionNodes(model, { costType: 'edge-count', maxPartitionSize: 2, maxIterations: 2 })
    expect(mapNodesToIds(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "root",
        ],
        [
          "b",
          "d",
        ],
        [
          "c",
          "e",
        ],
        [
          "f",
        ],
      ]
    `)
  })
})
