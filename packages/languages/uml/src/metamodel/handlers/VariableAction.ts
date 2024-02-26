import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Variable, VariableAction } from '../uml-metamodel'

export const VariableActionHandler = VariableAction.createHandler(
  (variableAction, { onlyContainmentAssociations }) => {
    const variable = resolve(variableAction, 'variable', { type: Variable })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_variable(variableAction, variable)
  },
)

function addEdge_variable(variableAction: GraphNode, variable: GraphNode | undefined) {
  // variable : Variable [1..1] (opposite A_variable_variableAction::variableAction)
  // The Variable to be read or written.
  if (!variable) {
    return
  }
  variableAction.model.addEdge('variable', variableAction, variable)
}
