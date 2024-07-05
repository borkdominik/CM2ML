import type { GraphNode } from '@cm2ml/ir'
import { GraphModel, Metamodel } from '@cm2ml/ir'

import type { Embedding } from '../src/embedding'
import type { LabeledNode } from '../src/normalization'

export function createTestModel(nodes: string[], edges: [string, string][] | (readonly [string, string])[]) {
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
      throw new Error(`Invalid edge: ${sourceId}-${targetId}`)
    }
    const edge = model.addEdge('edge', source, target)
    edge.type = 'edge'
  })
  return model
}

/**
 * Test model with strong connections between:
 * - root and a
 * - b and d
 * - c and e.
 */
export const testModel = createTestModel(['a', 'b', 'c', 'd', 'e', 'f'], [
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

export function mapNodesToIds(partitions: readonly Set<GraphNode>[]) {
  return partitions
    .map((partition) =>
      [...partition].map(({ id }) => id).sort(),
    )
    .sort((a, b) =>
      a[0]?.localeCompare(b[0] ?? '') ?? 0,
    )
}

export function formatEmbedding(embedding: Embedding) {
  function formatColumn(column: number) {
    return embedding.map((row) => row[column]).join(' ')
  }
  const table = embedding[0]
    .map((_, i) => formatColumn(i))
    .join('\n')
  return `\n${table}\n`
}

export function formatLabeledNode(labeledNode: LabeledNode) {
  return [
    labeledNode.id,
    Array.from(labeledNode.incomingEdges).map(({ source }) => source.id),
    Array.from(labeledNode.outgoingEdges).map(({ target }) => target.id),
  ]
}
