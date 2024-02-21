import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { ActivityNode } from '../uml-metamodel'

export const ActivityNodeHandler = ActivityNode.createHandler(
  (activityNode, { onlyContainmentAssociations }) => {
    const inPartition = resolveFromAttribute(activityNode, 'inPartition', { many: true })
    const incoming = resolveFromAttribute(activityNode, 'incoming', { many: true })
    const outgoing = resolveFromAttribute(activityNode, 'outgoing', { many: true })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_activity(activityNode)
    addEdge_inGroup(activityNode)
    addEdge_inInterruptibleRegion(activityNode)
    addEdge_inPartition(activityNode, inPartition)
    addEdge_inStructuredNode(activityNode)
    addEdge_incoming(activityNode, incoming)
    addEdge_outgoing(activityNode, outgoing)
    addEdge_redefinedNode(activityNode)
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

function addEdge_inInterruptibleRegion(_activityNode: GraphNode) {
  // TODO/Association
  // inInterruptibleRegion : InterruptibleActivityRegion [0..*]{subsets ActivityNode::inGroup} (opposite InterruptibleActivityRegion::node)
  // InterruptibleActivityRegions containing the ActivityNode.
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

function addEdge_redefinedNode(_activityNode: GraphNode) {
  // TODO/Association
  // redefinedNode : ActivityNode [0..*]{subsets RedefinableElement::redefinedElement} (opposite A_redefinedNode_activityNode::activityNode)
  // ActivityNodes from a generalization of the Activity containining this ActivityNode that are redefined by this ActivityNode.
}
