import { describe, expect, it } from 'vitest'

import type { LabeledNode } from '../src/normalization'
import { normalizePartition } from '../src/normalization'
import { partitionNodes } from '../src/partitioning'
import { restorePartitionEdges } from '../src/restoration'

import { testModel } from './test-utils'

describe('normalization', () => {
  it('creates labeled and indexed nodes', () => {
    const result = partitionNodes(testModel, { costType: 'edge-count', maxPartitionSize: 4, maxIterations: 2 })
      .map(restorePartitionEdges)
      .map(normalizePartition)
      .map((partition) => partition.map(prettyFormatLabeledNode))
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
  })
})

function prettyFormatLabeledNode(labeledNode: LabeledNode) {
  return [
    labeledNode.id,
    Array.from(labeledNode.incomingEdges).map(({ source }) => source.id),
    Array.from(labeledNode.outgoingEdges).map(({ target }) => target.id),
  ]
}
