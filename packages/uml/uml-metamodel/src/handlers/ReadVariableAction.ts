import type { GraphNode } from '@cm2ml/ir'

import { ReadVariableAction } from '../uml-metamodel'

export const ReadVariableActionHandler = ReadVariableAction.createHandler(
  (readVariableAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_result(readVariableAction)
  },
)

function addEdge_result(_readVariableAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_readVariableAction::readVariableAction)
  // The OutputPin on which the result values are placed.
}
