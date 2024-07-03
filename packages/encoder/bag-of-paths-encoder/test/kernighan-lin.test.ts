import { GraphModel, Metamodel } from '@cm2ml/ir'
import { describe, expect, it } from 'vitest'

import { kernighanLin } from '../src/kernighan-lin'

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
  it('should partition nodes', () => {
    const result = kernighanLin(Array.from(model.nodes), { maxIterations: -1 }).map((partition) => partition.map(({ id }) => id))
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "root",
          "c",
          "a",
          "f",
          "b",
        ],
        [
          "d",
          "h",
          "e",
          "g",
        ],
      ]
    `)
  })

  it('handles zero iterations', () => {
    const result = kernighanLin(Array.from(model.nodes), { maxIterations: 0 }).map((partition) => partition.map(({ id }) => id))
    // Output is the initial partition, as no iterations are performed
    expect(result).toMatchInlineSnapshot(`
      [
        [
          "root",
          "b",
          "d",
          "f",
          "h",
        ],
        [
          "a",
          "c",
          "e",
          "g",
        ],
      ]
    `)
  })
})

function createTestModel(nodes: string[], edges: [string, string][]) {
  const metamodel = new Metamodel({
    attributes: ['id', 'type'],
    idAttribute: 'id',
    types: ['node', 'edge'],
    typeAttributes: ['type'],
    tags: ['tag'],
  })
  const model = new GraphModel(metamodel, { debug: false, strict: true })
  const root = model.createRootNode('root')
  root.id = 'root'
  root.type = 'node'
  nodes.forEach((id) => {
    const graphNode = model.addNode('node')
    graphNode.id = id
    graphNode.type = 'node'
    graphNode.parent = root
  })
  edges.forEach(([sourceId, targetId]) => {
    const source = model.getNodeById(sourceId)
    const target = model.getNodeById(targetId)
    if (!source || !target) {
      throw new Error('Invalid edge')
    }
    const edge = model.addEdge('edge', source, target)
    edge.type = 'edge'
  })
  return model
}
