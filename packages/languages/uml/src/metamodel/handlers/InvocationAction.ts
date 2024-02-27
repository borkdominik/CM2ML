import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { InputPin, InvocationAction, Port } from '../uml-metamodel'

export const InvocationActionHandler = InvocationAction.createHandler(
  (invocationAction, { onlyContainmentAssociations }) => {
    const arguments_ = resolve(invocationAction, 'argument', { many: true, type: InputPin })
    const onPort = resolve(invocationAction, 'onPort', { type: Port })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_argument(invocationAction, arguments_)
    addEdge_onPort(invocationAction, onPort)
  },
)

function addEdge_argument(invocationAction: GraphNode, arguments_: GraphNode[]) {
  // ♦ argument : InputPin [0..*]{ordered, subsets Action::input} (opposite A_argument_invocationAction::invocationAction)
  // The InputPins that provide the argument values passed in the invocation request.
  arguments_.forEach((argument) => {
    invocationAction.model.addEdge('argument', invocationAction, argument)
  })
}

function addEdge_onPort(invocationAction: GraphNode, onPort: GraphNode | undefined) {
  // onPort : Port [0..1] (opposite A_onPort_invocationAction::invocationAction)
  // For CallOperationActions, SendSignalActions, and SendObjectActions, an optional Port of the target object through which the invocation request is sent.
  if (!onPort) {
    return
  }
  invocationAction.model.addEdge('onPort', invocationAction, onPort)
}
