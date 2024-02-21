import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute, resolveFromChild } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Activity, Variable } from '../uml-metamodel'

export const ActivityHandler = Activity.createHandler(
  (activity, { onlyContainmentAssociations }) => {
    const groups = resolveFromAttribute(activity, 'group', { many: true })
    const nodes = resolveFromAttribute(activity, 'node', { many: true })
    const partitions = resolveFromAttribute(activity, 'partition', { many: true })
    const variables = resolveFromChild(activity, 'variable', { many: true, type: Variable })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_edge(activity)
    addEdge_group(activity, groups)
    addEdge_node(activity, nodes)
    addEdge_partition(activity, partitions)
    addEdge_structuredNode(activity)
    addEdge_variable(activity, variables)
  },
  {
    [Uml.Attributes.isReadOnly]: 'false',
    [Uml.Attributes.isSingleExecution]: 'false',
  },
)

function addEdge_edge(_activity: GraphNode) {
  // TODO/Association
  // ♦ edge : ActivityEdge [0..*]{subsets Element::ownedElement} (opposite ActivityEdge::activity)
  // ActivityEdges expressing flow between the nodes of the Activity.
}

function addEdge_group(activity: GraphNode, groups: GraphNode[]) {
  // TODO/Association
  // ♦ group : ActivityGroup [0..*]{subsets Element::ownedElement} (opposite ActivityGroup::inActivity)
  // Top-level ActivityGroups in the Activity.
  groups.forEach((group) => {
    activity.model.addEdge('group', activity, group)
  })
}

function addEdge_node(activity: GraphNode, nodes: GraphNode[]) {
  // TODO/Association
  // ♦ node : ActivityNode [0..*]{subsets Element::ownedElement} (opposite ActivityNode::activity)
  // ActivityNodes coordinated by the Activity.
  nodes.forEach((node) => {
    activity.model.addEdge('node', activity, node)
  })
}

function addEdge_partition(activity: GraphNode, partitions: GraphNode[]) {
  // TODO/Association
  // partition : ActivityPartition [0..*]{subsets Activity::group} (opposite A_partition_activity::activity)
  // Top-level ActivityPartitions in the Activity.
  partitions.forEach((partition) => {
    activity.model.addEdge('partition', activity, partition)
  })
}

function addEdge_structuredNode(_activity: GraphNode) {
  // TODO/Association
  // ♦ structuredNode : StructuredActivityNode [0..*]{subsets Activity::group, subsets Activity::node} (opposite StructuredActivityNode::activity)
  // Top-level StructuredActivityNodes in the Activity.
}

function addEdge_variable(activity: GraphNode, variables: GraphNode[]) {
  // TODO/Association
  // ♦ variable : Variable [0..*]{subsets Namespace::ownedMember} (opposite Variable::activityScope)
  // Top-level Variables defined by the Activity.
  variables.forEach((variable) => {
    activity.model.addEdge('variable', activity, variable)
  })
}
