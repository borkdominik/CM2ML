import { describe, expect, it } from 'vitest'

import { embedPartitions } from '../src/embedding'
import { normalizePartitions } from '../src/normalization'
import { partitionNodes } from '../src/partitioning'
import { restorePartitionEdges } from '../src/restoration'

import { formatEmbedding, testModel } from './test-utils'

describe('embedding', () => {
  it('creates the embedding', () => {
    const { normalizedPartitions, mapping } = normalizePartitions(
      partitionNodes(
        testModel,
        { costType: 'edge-count', maxPartitionSize: 4, maxPartitioningIterations: 2 },
      )
        .map(restorePartitionEdges),
    )
    const result = formatEmbedding(embedPartitions(normalizedPartitions))
    expect(result).toMatchInlineSnapshot(`
      "
      node_0->node_3[label="edge"] 1 0
      node_0->node_1[label="edge"] 1 0
      node_0->node_4[label="edge"] 1 0
      node_0->node_2[label="edge"] 1 0
      node_0->node_5[label="edge"] 1 0
      node_0->node_6[label="edge"] 1 0
      node_1->node_2[label="edge"] 1 1
      node_2->node_1[label="edge"] 1 1
      node_3->node_0[label="edge"] 1 1
      node_4->node_5[label="edge"] 1 0
      node_5->node_4[label="edge"] 1 0
      node_3->node_1[label="edge"] 0 1
      node_3->node_2[label="edge"] 0 1
      "
    `)
    expect(mapping).toMatchInlineSnapshot(`
      {
        "node_0": [
          "root",
          "f",
        ],
        "node_1": [
          "b",
          "c",
        ],
        "node_2": [
          "d",
          "e",
        ],
        "node_3": [
          "a",
          "root",
        ],
        "node_4": [
          "c",
        ],
        "node_5": [
          "e",
        ],
        "node_6": [
          "f",
        ],
      }
    `)
  })
})
