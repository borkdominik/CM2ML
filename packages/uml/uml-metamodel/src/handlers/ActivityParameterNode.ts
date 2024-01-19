import type { GraphNode } from '@cm2ml/ir'

import { ActivityParameterNode } from '../uml-metamodel'

export const ActivityParameterNodeHandler = ActivityParameterNode.createHandler(
  (activityParameterNode, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_parameter(activityParameterNode)
  },
)

function addEdge_parameter(_activityParameterNode: GraphNode) {
  // TODO/Association
  // parameter : Parameter [1..1] (opposite A_parameter_activityParameterNode::activityParameterNode)
  // The Parameter for which the ActivityParameterNode will be accepting or providing values.
}
