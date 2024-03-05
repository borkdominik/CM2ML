import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { CallAction, OutputPin } from '../uml-metamodel'

export const CallActionHandler = CallAction.createHandler(
  (callAction, { onlyContainmentAssociations }) => {
    const results = resolve(callAction, 'result', { many: true, type: OutputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_result(callAction, results)
  },
  {
    [Uml.Attributes.isSynchronous]: 'true',
  },
)

function addEdge_result(callAction: GraphNode, results: GraphNode[]) {
  // ♦ result : OutputPin [0..*]{ordered, subsets Action::output} (opposite A_result_callAction::callAction)
  // The OutputPins on which the reply values from the invocation are placed (if the call is synchronous).
  results.forEach((result) => {
    callAction.model.addEdge('result', callAction, result)
  })
}
