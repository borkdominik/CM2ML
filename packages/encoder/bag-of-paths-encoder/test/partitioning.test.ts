import { describe, expect, it } from 'vitest'

import { partitionNodes } from '../src/partitioning'

import { mapNodesToIds, testModel } from './test-utils'

describe('partitioning', () => {
  it('creates balanced partitions', () => {
    const result = partitionNodes(testModel, { costType: 'edge-count', maxPartitionSize: 2, maxPartitioningIterations: 2 })
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
