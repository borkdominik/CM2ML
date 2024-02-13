import type { GraphNode } from '@cm2ml/ir'

import { RaiseExceptionAction } from '../uml-metamodel'

export const RaiseExceptionActionHandler = RaiseExceptionAction.createHandler(
  (raiseExceptionAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_exception(raiseExceptionAction)
  },
)

function addEdge_exception(_raiseExceptionAction: GraphNode) {
  // TODO/Association
  // ♦ exception : InputPin [1..1]{subsets Action::input} (opposite A_exception_raiseExceptionAction::raiseExceptionAction)
  // An InputPin whose value becomes the exception object.
}
