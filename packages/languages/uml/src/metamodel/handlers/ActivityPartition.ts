import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Uml } from '../uml'
import { ActivityPartition } from '../uml-metamodel'

export const ActivityPartitionHandler = ActivityPartition.createHandler(
  (activityPartition, { onlyContainmentAssociations }) => {
    const edges = resolveFromAttribute(activityPartition, 'edge', { many: true })
    const nodes = resolveFromAttribute(activityPartition, 'node', { many: true })
    const represents = resolveFromAttribute(activityPartition, 'represents')
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_edge(activityPartition, edges)
    addEdge_node(activityPartition, nodes)
    addEdge_represents(activityPartition, represents)
    addEdge_subpartition(activityPartition)
    addEdge_superPartition(activityPartition)
  },
  {
    [Uml.Attributes.isDimension]: 'false',
    [Uml.Attributes.isExternal]: 'false',
  },
)

function addEdge_edge(activityPartition: GraphNode, edges: GraphNode[]) {
  // TODO/Association
  // edge : ActivityEdge [0..*]{subsets ActivityGroup::containedEdge} (opposite ActivityEdge::inPartition)
  // ActivityEdges immediately contained in the ActivityPartition.
  edges.forEach((edge) => {
    activityPartition.model.addEdge('edge', activityPartition, edge)
  })
}

function addEdge_node(activityPartition: GraphNode, nodes: GraphNode[]) {
  // node : ActivityNode [0..*]{subsets ActivityGroup::containedNode} (opposite ActivityNode::inPartition)
  // ActivityNodes immediately contained in the ActivityPartition.
  nodes.forEach((node) => {
    activityPartition.model.addEdge('node', activityPartition, node)
  })
}

function addEdge_represents(activityPartition: GraphNode, represents: GraphNode | undefined) {
  // represents : Element [0..1] (opposite A_represents_activityPartition::activityPartition)
  // An Element represented by the functionality modeled within the ActivityPartition.
  if (!represents) {
    return
  }
  activityPartition.model.addEdge('represents', activityPartition, represents)
}

function addEdge_subpartition(_activityPartition: GraphNode) {
  // TODO/Association
  // ♦ subpartition : ActivityPartition [0..*]{subsets ActivityGroup::subgroup} (opposite ActivityPartition::superPartition)
  // Other ActivityPartitions immediately contained in this ActivityPartition (as its subgroups).
}

function addEdge_superPartition(_activityPartition: GraphNode) {
  // TODO/Association
  // superPartition : ActivityPartition [0..1]{subsets ActivityGroup::superGroup} (opposite ActivityPartition::subpartition)
  // Other ActivityPartitions immediately containing this ActivityPartition (as its superGroups).
}
