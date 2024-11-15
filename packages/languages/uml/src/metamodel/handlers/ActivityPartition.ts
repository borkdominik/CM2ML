import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { ActivityEdge, ActivityNode, ActivityPartition, Element } from '../uml-metamodel'

export const ActivityPartitionHandler = ActivityPartition.createHandler(
  (activityPartition, { onlyContainmentAssociations }) => {
    const edges = resolve(activityPartition, 'edge', { many: true, type: ActivityEdge })
    const nodes = resolve(activityPartition, 'node', { many: true, type: ActivityNode })
    const represents = resolve(activityPartition, 'represents', { type: Element })
    const subpartition = resolve(activityPartition, 'subpartition', { many: true, type: ActivityPartition })
    const superPartition = resolve(activityPartition, 'superPartition', { type: ActivityPartition })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_edge(activityPartition, edges)
    addEdge_node(activityPartition, nodes)
    addEdge_represents(activityPartition, represents)
    addEdge_subpartition(activityPartition, subpartition)
    addEdge_superPartition(activityPartition, superPartition)
  },
  {
    [Uml.Attributes.isDimension]: { type: 'boolean', defaultValue: 'false' },
    [Uml.Attributes.isExternal]: { type: 'boolean', defaultValue: 'false' },
  },
)

function addEdge_edge(activityPartition: GraphNode, edges: GraphNode[]) {
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

function addEdge_subpartition(activityPartition: GraphNode, subpartition: GraphNode[]) {
  // ♦ subpartition : ActivityPartition [0..*]{subsets ActivityGroup::subgroup} (opposite ActivityPartition::superPartition)
  // Other ActivityPartitions immediately contained in this ActivityPartition (as its subgroups).
  subpartition.forEach((subpartition) => {
    activityPartition.model.addEdge('subpartition', activityPartition, subpartition)
  })
}

function addEdge_superPartition(activityPartition: GraphNode, superPartition: GraphNode | undefined) {
  // superPartition : ActivityPartition [0..1]{subsets ActivityGroup::superGroup} (opposite ActivityPartition::subpartition)
  // Other ActivityPartitions immediately containing this ActivityPartition (as its superGroups).
  if (!superPartition) {
    return
  }
  activityPartition.model.addEdge('superPartition', activityPartition, superPartition)
}
