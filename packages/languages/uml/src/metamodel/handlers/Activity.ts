import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Activity, ActivityGroup, ActivityNode, ActivityPartition, StructuredActivityNode, Variable } from '../uml-metamodel'

export const ActivityHandler = Activity.createHandler(
  (activity, { onlyContainmentAssociations }) => {
    const groups = resolve(activity, 'group', { many: true, type: ActivityGroup })
    const nodes = resolve(activity, 'node', { many: true, type: ActivityNode })
    const partitions = resolve(activity, 'partition', { many: true, type: ActivityPartition })
    const structuredNodes = resolve(activity, 'structuredNode', { many: true, type: StructuredActivityNode })
    const variables = resolve(activity, 'variable', { many: true, type: Variable })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_edge(activity)
    addEdge_group(activity, groups)
    addEdge_node(activity, nodes)
    addEdge_partition(activity, partitions)
    addEdge_structuredNode(activity, structuredNodes)
    addEdge_variable(activity, variables)
  },
  {
    [Uml.Attributes.isReadOnly]: { type: 'boolean', defaultValue: 'false' },
    [Uml.Attributes.isSingleExecution]: { type: 'boolean', defaultValue: 'false' },
  },
)

function addEdge_edge(_activity: GraphNode) {
  // TODO/Association
  // ♦ edge : ActivityEdge [0..*]{subsets Element::ownedElement} (opposite ActivityEdge::activity)
  // ActivityEdges expressing flow between the nodes of the Activity.
}

function addEdge_group(activity: GraphNode, groups: GraphNode[]) {
  // ♦ group : ActivityGroup [0..*]{subsets Element::ownedElement} (opposite ActivityGroup::inActivity)
  // Top-level ActivityGroups in the Activity.
  groups.forEach((group) => {
    activity.model.addEdge('group', activity, group)
  })
}

function addEdge_node(activity: GraphNode, nodes: GraphNode[]) {
  // ♦ node : ActivityNode [0..*]{subsets Element::ownedElement} (opposite ActivityNode::activity)
  // ActivityNodes coordinated by the Activity.
  nodes.forEach((node) => {
    activity.model.addEdge('node', activity, node)
  })
}

function addEdge_partition(activity: GraphNode, partitions: GraphNode[]) {
  // partition : ActivityPartition [0..*]{subsets Activity::group} (opposite A_partition_activity::activity)
  // Top-level ActivityPartitions in the Activity.
  partitions.forEach((partition) => {
    activity.model.addEdge('partition', activity, partition)
  })
}

function addEdge_structuredNode(activity: GraphNode, structuredNodes: GraphNode[]) {
  // ♦ structuredNode : StructuredActivityNode [0..*]{subsets Activity::group, subsets Activity::node} (opposite StructuredActivityNode::activity)
  // Top-level StructuredActivityNodes in the Activity.
  structuredNodes.forEach((structuredNode) => {
    activity.model.addEdge('structuredNode', activity, structuredNode)
  })
}

function addEdge_variable(activity: GraphNode, variables: GraphNode[]) {
  // ♦ variable : Variable [0..*]{subsets Namespace::ownedMember} (opposite Variable::activityScope)
  // Top-level Variables defined by the Activity.
  variables.forEach((variable) => {
    activity.model.addEdge('variable', activity, variable)
  })
}
