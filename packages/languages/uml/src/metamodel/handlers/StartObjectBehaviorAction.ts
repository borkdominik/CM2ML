import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { InputPin, StartObjectBehaviorAction } from '../uml-metamodel'

export const StartObjectBehaviorActionHandler =
  StartObjectBehaviorAction.createHandler(
    (startObjectBehaviorAction, { onlyContainmentAssociations }) => {
      const object = resolve(startObjectBehaviorAction, 'object', { type: InputPin })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_object(startObjectBehaviorAction, object)
    },
  )

function addEdge_object(startObjectBehaviorAction: GraphNode, object: GraphNode | undefined) {
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_startObjectBehaviorAction::startObjectBehaviorAction)
  // An InputPin that holds the object that is either a Behavior to be started or has a classifierBehavior to be started.
  if (!object) {
    return
  }
  startObjectBehaviorAction.model.addEdge('object', startObjectBehaviorAction, object)
}
