import { describe, expect, it } from 'vitest'

import { normalizePartitions } from '../src/normalization'
import { partitionNodes } from '../src/partitioning'
import { restorePartitionEdges } from '../src/restoration'

import { formatLabeledNode, testModel } from './test-utils'

describe('normalization', () => {
  it('creates labeled and indexed nodes', () => {
    const partitions = partitionNodes(testModel, { costType: 'edge-count', maxPartitionSize: 4, maxPartitioningIterations: 2 })
      .map(restorePartitionEdges)
    const { normalizedPartitions, mapping } = normalizePartitions(partitions)
    const result = normalizedPartitions.map((partition) => partition.map(formatLabeledNode))
    expect(result).toMatchInlineSnapshot(`
      [
        [
          [
            "node_0",
            [
              "node_3",
              "node_3",
            ],
            [
              "node_3",
              "node_1",
              "node_4",
              "node_2",
              "node_5",
              "node_6",
            ],
          ],
          [
            "node_1",
            [
              "node_0",
              "node_2",
            ],
            [
              "node_2",
            ],
          ],
          [
            "node_2",
            [
              "node_0",
              "node_1",
            ],
            [
              "node_1",
            ],
          ],
          [
            "node_3",
            [
              "node_0",
            ],
            [
              "node_0",
              "node_0",
            ],
          ],
          [
            "node_4",
            [
              "node_0",
              "node_5",
            ],
            [
              "node_5",
            ],
          ],
          [
            "node_5",
            [
              "node_0",
              "node_4",
            ],
            [
              "node_4",
            ],
          ],
          [
            "node_6",
            [
              "node_0",
            ],
            [],
          ],
        ],
        [
          [
            "node_0",
            [
              "node_3",
            ],
            [],
          ],
          [
            "node_1",
            [
              "node_2",
              "node_3",
            ],
            [
              "node_2",
            ],
          ],
          [
            "node_2",
            [
              "node_1",
              "node_3",
            ],
            [
              "node_1",
            ],
          ],
          [
            "node_3",
            [],
            [
              "node_1",
              "node_2",
              "node_0",
            ],
          ],
        ],
      ]
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
