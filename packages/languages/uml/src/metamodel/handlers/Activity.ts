import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { Activity } from '../uml-metamodel'

export const ActivityHandler = Activity.createHandler(
  (activity, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_edge(activity)
    addEdge_group(activity)
    addEdge_node(activity)
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

function addEdge_group(_activity: GraphNode) {
  // TODO/Association
  // ♦ group : ActivityGroup [0..*]{subsets Element::ownedElement} (opposite ActivityGroup::inActivity)
  // Top-level ActivityGroups in the Activity.
}

function addEdge_node(_activity: GraphNode) {
  // TODO/Association
  // ♦ node : ActivityNode [0..*]{subsets Element::ownedElement} (opposite ActivityNode::activity)
  // ActivityNodes coordinated by the Activity.
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
