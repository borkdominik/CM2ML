import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ActivityEdge, ActivityNode, ActivityPartition, InterruptibleActivityRegion } from '../uml-metamodel'

export const ActivityNodeHandler = ActivityNode.createHandler(
  (activityNode, { onlyContainmentAssociations }) => {
    const inInterruptibleRegions = resolve(activityNode, 'inInterruptibleRegion', { many: true, type: InterruptibleActivityRegion })
    const inPartition = resolve(activityNode, 'inPartition', { many: true, type: ActivityPartition })
    const incoming = resolve(activityNode, 'incoming', { many: true, type: ActivityEdge })
    const outgoing = resolve(activityNode, 'outgoing', { many: true, type: ActivityEdge })
    const redefinedNodes = resolve(activityNode, 'redefinedNode', { many: true, type: ActivityNode })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_activity(activityNode)
    addEdge_inGroup(activityNode)
    addEdge_inInterruptibleRegion(activityNode, inInterruptibleRegions)
    addEdge_inPartition(activityNode, inPartition)
    addEdge_inStructuredNode(activityNode)
    addEdge_incoming(activityNode, incoming)
    addEdge_outgoing(activityNode, outgoing)
    addEdge_redefinedNode(activityNode, redefinedNodes)
  },
)

function addEdge_activity(_activityNode: GraphNode) {
  // TODO/Association
  // activity : Activity [0..1]{subsets Element::owner} (opposite Activity::node)
  // The Activity containing the ActivityNode, if it is directly owned by an Activity.
}

function addEdge_inGroup(_activityNode: GraphNode) {
  // TODO/Association
  // /inGroup : ActivityGroup [0..*]{union} (opposite ActivityGroup::containedNode)
  // ActivityGroups containing the ActivityNode.
}

function addEdge_inInterruptibleRegion(activityNode: GraphNode, inInterruptibleRegions: GraphNode[]) {
  // inInterruptibleRegion : InterruptibleActivityRegion [0..*]{subsets ActivityNode::inGroup} (opposite InterruptibleActivityRegion::node)
  // InterruptibleActivityRegions containing the ActivityNode.
  inInterruptibleRegions.forEach((inInterruptibleRegion) => {
    activityNode.model.addEdge('inInterruptibleRegion', activityNode, inInterruptibleRegion)
  })
}

function addEdge_inPartition(activityNode: GraphNode, inPartition: GraphNode[]) {
  // inPartition : ActivityPartition [0..*]{subsets ActivityNode::inGroup} (opposite ActivityPartition::node)
  // ActivityPartitions containing the ActivityNode.
  inPartition.forEach((inPartition) => {
    activityNode.model.addEdge('inPartition', activityNode, inPartition)
  })
}

function addEdge_inStructuredNode(_activityNode: GraphNode) {
  // TODO/Association
  // inStructuredNode : StructuredActivityNode [0..1]{subsets Element::owner, subsets ActivityNode::inGroup} (opposite StructuredActivityNode::node)
  // The StructuredActivityNode containing the ActvityNode, if it is directly owned by a StructuredActivityNode.
}

function addEdge_incoming(activityNode: GraphNode, incoming: GraphNode[]) {
  // incoming : ActivityEdge [0..*] (opposite ActivityEdge::target)
  // ActivityEdges that have the ActivityNode as their target.
  incoming.forEach((incoming) => {
    activityNode.model.addEdge('incoming', activityNode, incoming)
  })
}

function addEdge_outgoing(activityNode: GraphNode, outgoing: GraphNode[]) {
  // outgoing : ActivityEdge [0..*] (opposite ActivityEdge::source)
  // ActivityEdges that have the ActivityNode as their source.
  outgoing.forEach((outgoing) => {
    activityNode.model.addEdge('outgoing', activityNode, outgoing)
  })
}

function addEdge_redefinedNode(activityNode: GraphNode, redefinedNodes: GraphNode[]) {
  // redefinedNode : ActivityNode [0..*]{subsets RedefinableElement::redefinedElement} (opposite A_redefinedNode_activityNode::activityNode)
  // ActivityNodes from a generalization of the Activity containining this ActivityNode that are redefined by this ActivityNode.
  redefinedNodes.forEach((redefinedNode) => {
    activityNode.model.addEdge('redefinedNode', activityNode, redefinedNode)
  })
}
