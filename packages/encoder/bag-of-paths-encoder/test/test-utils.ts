import type { GraphNode } from '@cm2ml/ir'
import { GraphModel, Metamodel } from '@cm2ml/ir'

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

export function mapNodesToIds(partitions: readonly GraphNode[][]) {
  return partitions
    .map((partition) =>
      partition.map(({ id }) => id).sort(),
    )
    .sort((a, b) =>
      a[0]?.localeCompare(b[0] ?? '') ?? 0,
    )
}
