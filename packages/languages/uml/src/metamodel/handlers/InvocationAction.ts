import type { GraphNode } from '@cm2ml/ir'

import { resolveFromChild } from '../resolvers/resolve'
import { InputPin, InvocationAction } from '../uml-metamodel'

export const InvocationActionHandler = InvocationAction.createHandler(
  (invocationAction, { onlyContainmentAssociations }) => {
    const arguments_ = resolveFromChild(invocationAction, 'argument', { many: true, type: InputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_argument(invocationAction, arguments_)
    addEdge_onPort(invocationAction)
  },
)

function addEdge_argument(invocationAction: GraphNode, arguments_: GraphNode[]) {
  // TODO/Association
  // ♦ argument : InputPin [0..*]{ordered, subsets Action::input} (opposite A_argument_invocationAction::invocationAction)
  // The InputPins that provide the argument values passed in the invocation request.
  arguments_.forEach((argument) => {
    invocationAction.model.addEdge('argument', invocationAction, argument)
  })
}

function addEdge_onPort(_invocationAction: GraphNode) {
  // TODO/Association
  // onPort : Port [0..1] (opposite A_onPort_invocationAction::invocationAction)
  // For CallOperationActions, SendSignalActions, and SendObjectActions, an optional Port of the target object through which the invocation request is sent.
}
