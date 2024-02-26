import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Behavior, CallBehaviorAction } from '../uml-metamodel'

export const CallBehaviorActionHandler = CallBehaviorAction.createHandler(
  (callBehaviorAction, { onlyContainmentAssociations }) => {
    const behavior = resolveFromAttribute(callBehaviorAction, 'behavior', { type: Behavior })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_behavior(callBehaviorAction, behavior)
  },
)

function addEdge_behavior(callBehaviorAction: GraphNode, behavior: GraphNode | undefined) {
  // behavior : Behavior [1..1] (opposite A_behavior_callBehaviorAction::callBehaviorAction)
  // The Behavior being invoked.
  if (!behavior) {
    return
  }
  callBehaviorAction.model.addEdge('behavior', callBehaviorAction, behavior)
}
