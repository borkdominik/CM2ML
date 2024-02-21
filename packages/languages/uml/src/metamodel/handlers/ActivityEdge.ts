import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { ActivityEdge } from '../uml-metamodel'

export const ActivityEdgeHandler = ActivityEdge.createHandler(
  (activityEdge, { onlyContainmentAssociations }) => {
    const inPartitions = resolveFromAttribute(activityEdge, 'inPartition', { many: true })
    const source = resolveFromAttribute(activityEdge, 'source')
    const target = resolveFromAttribute(activityEdge, 'target')
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_activity(activityEdge)
    addEdge_guard(activityEdge)
    addEdge_inGroup(activityEdge)
    addEdge_inPartition(activityEdge, inPartitions)
    addEdge_inStructuredNode(activityEdge)
    addEdge_interrupts(activityEdge)
    addEdge_redefinedEdge(activityEdge)
    addEdge_source(activityEdge, source)
    addEdge_target(activityEdge, target)
    addEdge_weight(activityEdge)
  },
)

function addEdge_activity(_activityEdge: GraphNode) {
  // TODO/Association
  // activity : Activity [0..1]{subsets Element::owner} (opposite Activity::edge)
  // The Activity containing the ActivityEdge, if it is directly owned by an Activity.
}

function addEdge_guard(_activityEdge: GraphNode) {
  // TODO/Association
  // ♦ guard : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_guard_activityEdge::activityEdge)
  // A ValueSpecification that is evaluated to determine if a token can traverse the ActivityEdge. If an ActivityEdge has no guard, then there is no restriction on tokens traversing the edge.
}

function addEdge_inGroup(_activityEdge: GraphNode) {
  // TODO/Association
  // /inGroup : ActivityGroup [0..*]{union} (opposite ActivityGroup::containedEdge)
  // ActivityGroups containing the ActivityEdge.
}

function addEdge_inPartition(activityEdge: GraphNode, inPartitions: GraphNode[]) {
  // inPartition : ActivityPartition [0..*]{} (opposite ActivityPartition::edge)
  // Partitions containing the ActivityEdge.
  inPartitions.forEach((inPartition) => {
    activityEdge.model.addEdge('inPartition', activityEdge, inPartition)
  })
}

function addEdge_inStructuredNode(_activityEdge: GraphNode) {
  // TODO/Association
  // inStructuredNode : StructuredActivityNode [0..1]{subsets ActivityEdge::inGroup, subsets Element::owner} (opposite StructuredActivityNode::edge)
  // The StructuredActivityNode containing the ActivityEdge, if it is owned by a StructuredActivityNode.
}

function addEdge_interrupts(_activityEdge: GraphNode) {
  // TODO/Association
  // interrupts : InterruptibleActivityRegion [0..1] (opposite InterruptibleActivityRegion::interruptingEdge)
  // The InterruptibleActivityRegion for which this ActivityEdge is an interruptingEdge.
}

function addEdge_redefinedEdge(_activityEdge: GraphNode) {
  // TODO/Association
  // redefinedEdge : ActivityEdge [0..*]{subsets RedefinableElement::redefinedElement} (opposite A_redefinedEdge_activityEdge::activityEdge)
  // ActivityEdges from a generalization of the Activity containing this ActivityEdge that are redefined by this ActivityEdge.
}

function addEdge_source(activityEdge: GraphNode, source: GraphNode | undefined) {
  // TODO/Association
  // source : ActivityNode [1..1] (opposite ActivityNode::outgoing)
  // The ActivityNode from which tokens are taken when they traverse the ActivityEdge.
  if (!source) {
    return
  }
  activityEdge.model.addEdge('source', activityEdge, source)
}

function addEdge_target(activityEdge: GraphNode, target: GraphNode | undefined) {
  // TODO/Association
  // target : ActivityNode [1..1] (opposite ActivityNode::incoming)
  // The ActivityNode to which tokens are put when they traverse the ActivityEdge.
  if (!target) {
    return
  }
  activityEdge.model.addEdge('target', activityEdge, target)
}

function addEdge_weight(_activityEdge: GraphNode) {
  // TODO/Association
  // ♦ weight : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_weight_activityEdge::activityEdge)
  // The minimum number of tokens that must traverse the ActivityEdge at the same time. If no weight is specified, this is equivalent to specifying a constant value of 1.
}
