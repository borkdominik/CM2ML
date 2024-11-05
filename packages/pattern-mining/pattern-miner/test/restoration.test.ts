import { describe, expect, it } from 'vitest'

import { partitionNodes } from '../src/partitioning'
import { restorePartitionEdges } from '../src/restoration'

import { mapNodesToIds, testModel } from './test-utils'

describe('restoration', () => {
  it('restores edges by adding missing nodes to partitions', () => {
    const result = partitionNodes(testModel, { costType: 'edge-count', maxPartitionSize: 2, maxPartitioningIterations: 2 })
      .map(restorePartitionEdges)
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
