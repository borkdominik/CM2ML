import type { GraphNode } from '@cm2ml/ir'

import { Archimate } from '../archimate'
import { Relationship } from '../archimate-metamodel'

export const RelationshipHandler = Relationship.createHandler(
  (r, { relationshipsAsNodes }) => {
    const nodes = getSourceAndTargets(r)
    if (!nodes) {
      return console.error(`Missing source/target in relationship '${r.id}'`)
    }
    const { sourceNode, targetNode } = nodes
    const relType = r.getAttribute('xsi:type')?.value.literal
    if (!r || !Archimate.isValidType(relType)) {
      return console.error(`Missing or unknown type attribute in relationship '${r.id}'`)
    }
    if (relationshipsAsNodes) {
      r.model.addEdge('source', r, sourceNode)
      r.model.addEdge('target', r, targetNode)
    } else {
      r.model.addEdge(relType, sourceNode, targetNode)
      r.model.removeNode(r)
    }
  },
)

function getSourceAndTargets(r: GraphNode): { sourceNode: GraphNode, targetNode: GraphNode } | undefined {
  const sourceId = r.getAttribute('source')?.value.literal
  const targetId = r.getAttribute('target')?.value.literal
  if (!sourceId || !targetId) {
    return undefined
  }
  const sourceNode = r.model.getNodeById(sourceId)
  const targetNode = r.model.getNodeById(targetId)
  if (!sourceNode || !targetNode) {
    return undefined
  }
  return { sourceNode, targetNode }
}
