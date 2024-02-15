import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Activity } from '../uml-metamodel'

export const ActivityHandler = Activity.createHandler(
  (activity, { onlyContainmentAssociations }) => {
    const group = resolveFromAttribute(activity, 'group', { many: true })
    const node = resolveFromAttribute(activity, 'node', { many: true })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_edge(activity)
    addEdge_group(activity, group)
    addEdge_node(activity, node)
    addEdge_partition(activity)
    addEdge_structuredNode(activity)
    addEdge_variable(activity)
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

function addEdge_group(activity: GraphNode, group: GraphNode[]) {
  // TODO/Association
  // ♦ group : ActivityGroup [0..*]{subsets Element::ownedElement} (opposite ActivityGroup::inActivity)
  // Top-level ActivityGroups in the Activity.
  group.forEach((group) => {
    activity.model.addEdge('group', activity, group)
  })
}

function addEdge_node(activity: GraphNode, node: GraphNode[]) {
  // TODO/Association
  // ♦ node : ActivityNode [0..*]{subsets Element::ownedElement} (opposite ActivityNode::activity)
  // ActivityNodes coordinated by the Activity.
  node.forEach((node) => {
    activity.model.addEdge('node', activity, node)
  })
}

function addEdge_partition(_activity: GraphNode) {
  // TODO/Association
  // partition : ActivityPartition [0..*]{subsets Activity::group} (opposite A_partition_activity::activity)
  // Top-level ActivityPartitions in the Activity.
}

function addEdge_structuredNode(_activity: GraphNode) {
  // TODO/Association
  // ♦ structuredNode : StructuredActivityNode [0..*]{subsets Activity::group, subsets Activity::node} (opposite StructuredActivityNode::activity)
  // Top-level StructuredActivityNodes in the Activity.
}

function addEdge_variable(_activity: GraphNode) {
  // TODO/Association
  // ♦ variable : Variable [0..*]{subsets Namespace::ownedMember} (opposite Variable::activityScope)
  // Top-level Variables defined by the Activity.
}
