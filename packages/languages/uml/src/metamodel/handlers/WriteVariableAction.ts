import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { InputPin, WriteVariableAction } from '../uml-metamodel'

export const WriteVariableActionHandler = WriteVariableAction.createHandler(
  (writeVariableAction, { onlyContainmentAssociations }) => {
    const value = resolve(writeVariableAction, 'value', { type: InputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_value(writeVariableAction, value)
  },
)

function addEdge_value(writeVariableAction: GraphNode, value: GraphNode | undefined) {
  // ♦ value : InputPin [0..1]{subsets Action::input} (opposite A_value_writeVariableAction::writeVariableAction)
  // The InputPin that gives the value to be added or removed from the Variable.
  if (!value) {
    return
  }
  writeVariableAction.model.addEdge('value', writeVariableAction, value)
}
