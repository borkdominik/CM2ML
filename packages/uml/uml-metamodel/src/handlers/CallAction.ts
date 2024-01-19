import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { CallAction } from '../uml-metamodel'

export const CallActionHandler = CallAction.createHandler(
  (callAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_result(callAction)
  },
  {
    [Uml.Attributes.isSynchronous]: 'true',
  },
)

function addEdge_result(_callAction: GraphNode) {
  // TODO
  // ♦ result : OutputPin [0..*]{ordered, subsets Action::output} (opposite A_result_callAction::callAction)
  // The OutputPins on which the reply values from the invocation are placed (if the call is synchronous).
}
