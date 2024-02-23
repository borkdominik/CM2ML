import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { OutputPin, ReadVariableAction } from '../uml-metamodel'

export const ReadVariableActionHandler = ReadVariableAction.createHandler(
  (readVariableAction, { onlyContainmentAssociations }) => {
    const result = resolve(readVariableAction, 'result', { type: OutputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_result(readVariableAction, result)
  },
)

function addEdge_result(readVariableAction: GraphNode, result: GraphNode | undefined) {
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_readVariableAction::readVariableAction)
  // The OutputPin on which the result values are placed.
  if (!result) {
    return
  }
  readVariableAction.model.addEdge('result', readVariableAction, result)
}
