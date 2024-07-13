import { GraphModel, Metamodel } from '@cm2ml/ir'
import { describe, expect, it } from 'vitest'

import { embedPartitions } from '../src/embedding'
import { normalizePartitions } from '../src/normalization'
import { partitionNodes } from '../src/partitioning'
import { restorePartitionEdges } from '../src/restoration'

import { formatEmbedding } from './test-utils'

// The example model is taken from and compared to the one of the following paper:
// @inbook{
//   inbook,
//   author = { Fumagalli, Mattia and Prince Sales, Tiago and Guizzardi, Giancarlo },
//   year = { 2022},
//   month = { 10},
//   pages = { 52-62 },
//   title = { Pattern Discovery in Conceptual Models Using Frequent Itemset Mining },
//   isbn = { 978-3-031 - 17994 - 5 },
//   doi = { 10.1007/978-3-031-17995-2_4 }
// }

const metamodel = new Metamodel({
  attributes: ['id', 'type'],
  idAttribute: 'id',
  types: ['class'],
  typeAttributes: ['type'],
  tags: [],
})

const model = new GraphModel(metamodel, { debug: false, strict: true })
{
  function addNode(type: string) {
    const node = model.addNode(type)
    node.type = 'class'
    node.id = type
    return node
  }
  const vehicle = model.createRootNode('Vehicle')
  vehicle.type = 'class'
  vehicle.id = 'Vehicle'

  const vehiclePart = addNode('VehiclePart')
  const car = addNode('Car')

  const wheel = addNode('Wheel')
  const boat = addNode('Boat')
  const airplane = addNode('Airplane')

  const engine = addNode('Engine')

  // Left partition
  model.addEdge('GEN', wheel, vehiclePart)
  model.addEdge('GEN', engine, vehiclePart)

  // Right partition
  model.addEdge('GEN', car, vehicle)
  model.addEdge('GEN', boat, vehicle)
  model.addEdge('GEN', airplane, vehicle)

  // Partition bridge
  model.addEdge('partOf', vehiclePart, vehicle)
}

describe('paper example', () => {
  it(`matches the paper's result`, () => {
    const partitions = partitionNodes(model, { costType: 'edge-count', maxPartitionSize: 4, maxPartitioningIterations: 50 })
      .map(restorePartitionEdges)
    const { normalizedPartitions, mapping } = normalizePartitions(partitions, { maskNodeTypes: false })
    const result = formatEmbedding(embedPartitions(normalizedPartitions))
    // `class_4>class_0[partOf] 1 0` differs from the paper's result, which doesn't have the edge.
    // This is incorrect though, as the edge between Vehicle and VehiclePart must result in both nodes being present in both partitions.
    // Because both ends of the edge have different ids in both partitions, the entry is correct.
    expect(result).toMatchInlineSnapshot(`
      "
      class_1->class_0[label="GEN"] 1 1
      class_2->class_0[label="GEN"] 1 1
      class_3->class_0[label="GEN"] 1 0
      class_4->class_0[label="partOf"] 1 0
      class_0->class_3[label="partOf"] 0 1
      "
    `)
    expect(mapping).toMatchInlineSnapshot(`
      {
        "class_0": [
          "Vehicle",
          "VehiclePart",
        ],
        "class_1": [
          "Car",
          "Wheel",
        ],
        "class_2": [
          "Boat",
          "Engine",
        ],
        "class_3": [
          "Airplane",
          "Vehicle",
        ],
        "class_4": [
          "VehiclePart",
        ],
      }
    `)
  })
})
