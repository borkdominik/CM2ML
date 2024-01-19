import type { GraphNode } from '@cm2ml/ir'

import { CallBehaviorAction } from '../uml-metamodel'

export const CallBehaviorActionHandler = CallBehaviorAction.createHandler(
  (callBehaviorAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_behavior(callBehaviorAction)
  },
)

function addEdge_behavior(_callBehaviorAction: GraphNode) {
  // TODO/Association
  // behavior : Behavior [1..1] (opposite A_behavior_callBehaviorAction::callBehaviorAction)
  // The Behavior being invoked.
}
