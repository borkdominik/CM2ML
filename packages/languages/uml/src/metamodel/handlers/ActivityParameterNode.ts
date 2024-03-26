import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ActivityParameterNode, Parameter } from '../uml-metamodel'

export const ActivityParameterNodeHandler = ActivityParameterNode.createHandler(
  (activityParameterNode, { onlyContainmentAssociations }) => {
    const parameter = resolve(activityParameterNode, 'parameter', { type: Parameter })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_parameter(activityParameterNode, parameter)
  },
)

function addEdge_parameter(activityParameterNode: GraphNode, parameter: GraphNode | undefined) {
  // parameter : Parameter [1..1] (opposite A_parameter_activityParameterNode::activityParameterNode)
  // The Parameter for which the ActivityParameterNode will be accepting or providing values.
  if (!parameter) {
    return
  }
  activityParameterNode.model.addEdge('parameter', activityParameterNode, parameter)
}
