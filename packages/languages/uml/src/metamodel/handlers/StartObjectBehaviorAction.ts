import type { GraphNode } from '@cm2ml/ir'

import { StartObjectBehaviorAction } from '../uml-metamodel'

export const StartObjectBehaviorActionHandler =
  StartObjectBehaviorAction.createHandler(
    (startObjectBehaviorAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_object(startObjectBehaviorAction)
    },
  )

function addEdge_object(_startObjectBehaviorAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_startObjectBehaviorAction::startObjectBehaviorAction)
  // An InputPin that holds the object that is either a Behavior to be started or has a classifierBehavior to be started.
}
