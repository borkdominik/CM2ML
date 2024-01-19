import type { GraphNode } from '@cm2ml/ir'

import { StartClassifierBehaviorAction } from '../uml-metamodel'

export const StartClassifierBehaviorActionHandler =
  StartClassifierBehaviorAction.createHandler(
    (startClassifierBehaviorAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_object(startClassifierBehaviorAction)
    },
  )

function addEdge_object(_startClassifierBehaviorAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_startClassifierBehaviorAction::startClassifierBehaviorAction)
  // The InputPin that holds the object whose classifierBehavior is to be started.
}
