import { describe, expect, it } from 'vitest'

import { partitionNodes } from '../src/partitions'
import { restorePartitions } from '../src/restoration'

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
  // Weak links that will be restored
  ['root', 'b'],
  ['root', 'c'],
  ['root', 'd'],
  ['root', 'e'],
  ['root', 'f'],
])

describe('node restoration', () => {
  it('', () => {
    const result = restorePartitions(partitionNodes(model, { costType: 'edge-count', maxPartitionSize: 2, maxIterations: 2 }))
    expect(mapNodesToIds(result)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "b",
          "c",
          "d",
          "e",
          "f",
          "root",
        ],
        [
          "b",
          "d",
          "root",
        ],
        [
          "c",
          "e",
          "root",
        ],
        [
          "f",
          "root",
        ],
      ]
    `)
  })
})
