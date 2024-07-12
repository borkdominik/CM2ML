import { describe, expect, it } from 'vitest'

import { embedPartitions } from '../src/embedding'
import { normalizePartition } from '../src/normalization'
import { partitionNodes } from '../src/partitioning'
import { restorePartitionEdges } from '../src/restoration'

import { formatEmbedding, testModel } from './test-utils'

describe('embedding', () => {
  it('creates the embedding', () => {
    const partitions = partitionNodes(testModel, { costType: 'edge-count', maxPartitionSize: 4, maxPartitioningIterations: 2 })
      .map(restorePartitionEdges)
      .map(normalizePartition)
    const result = formatEmbedding(embedPartitions(partitions))
    expect(result).toMatchInlineSnapshot(`
      "
      node_0->node_3[edge] 1 0
      node_0->node_1[edge] 1 0
      node_0->node_4[edge] 1 0
      node_0->node_2[edge] 1 0
      node_0->node_5[edge] 1 0
      node_0->node_6[edge] 1 0
      node_1->node_2[edge] 1 1
      node_2->node_1[edge] 1 1
      node_3->node_0[edge] 1 1
      node_4->node_5[edge] 1 0
      node_5->node_4[edge] 1 0
      node_3->node_1[edge] 0 1
      node_3->node_2[edge] 0 1
      "
    `)
  })
})
