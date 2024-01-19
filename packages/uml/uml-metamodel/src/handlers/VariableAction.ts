import type { GraphNode } from '@cm2ml/ir'

import { VariableAction } from '../uml-metamodel'

export const VariableActionHandler = VariableAction.createHandler(
  (variableAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_variable(variableAction)
  },
)

function addEdge_variable(_variableAction: GraphNode) {
  // TODO
  // variable : Variable [1..1] (opposite A_variable_variableAction::variableAction)
  // The Variable to be read or written.
}
