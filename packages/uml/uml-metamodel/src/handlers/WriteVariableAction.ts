import type { GraphNode } from '@cm2ml/ir'

import { WriteVariableAction } from '../uml-metamodel'

export const WriteVariableActionHandler = WriteVariableAction.createHandler(
  (writeVariableAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      // return
    }
    addEdge_value(writeVariableAction)
  },
)

function addEdge_value(_writeVariableAction: GraphNode) {
  // TODO
  // ♦ value : InputPin [0..1]{subsets Action::input} (opposite A_value_writeVariableAction::writeVariableAction)
  // The InputPin that gives the value to be added or removed from the Variable.
}
