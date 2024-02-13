import type { GraphNode } from '@cm2ml/ir'

import { ActivityGroup } from '../uml-metamodel'

export const ActivityGroupHandler = ActivityGroup.createHandler(
  (activityGroup, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_containedEdge(activityGroup)
    addEdge_containedNode(activityGroup)
    addEdge_inActivity(activityGroup)
    addEdge_subgroup(activityGroup)
    addEdge_superGroup(activityGroup)
  },
)

function addEdge_containedEdge(_activityGroup: GraphNode) {
  // TODO/Association
  // /containedEdge : ActivityEdge [0..*]{union} (opposite ActivityEdge::inGroup)
  // ActivityEdges immediately contained in the ActivityGroup.
}

function addEdge_containedNode(_activityGroup: GraphNode) {
  // TODO/Association
  // /containedNode : ActivityNode [0..*]{union} (opposite ActivityNode::inGroup)
  // ActivityNodes immediately contained in the ActivityGroup.
}

function addEdge_inActivity(_activityGroup: GraphNode) {
  // TODO/Association
  // inActivity : Activity [0..1]{subsets Element::owner} (opposite Activity::group)
  // The Activity containing the ActivityGroup, if it is directly owned by an Activity.
}

function addEdge_subgroup(_activityGroup: GraphNode) {
  // TODO/Association
  // ♦ /subgroup : ActivityGroup [0..*]{union, subsets Element::ownedElement} (opposite ActivityGroup::superGroup)
  // Other ActivityGroups immediately contained in this ActivityGroup.
}

function addEdge_superGroup(_activityGroup: GraphNode) {
  // TODO/Association
  // /superGroup : ActivityGroup [0..1]{union, subsets Element::owner} (opposite ActivityGroup::subgroup)
  // The ActivityGroup immediately containing this ActivityGroup, if it is directly owned by another ActivityGroup.
}
