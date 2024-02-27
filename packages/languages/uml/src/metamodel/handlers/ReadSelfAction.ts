import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { OutputPin, ReadSelfAction } from '../uml-metamodel'

export const ReadSelfActionHandler = ReadSelfAction.createHandler(
  (readSelfAction, { onlyContainmentAssociations }) => {
    const result = resolve(readSelfAction, 'result', { type: OutputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_result(readSelfAction, result)
  },
)

function addEdge_result(readSelfAction: GraphNode, result: GraphNode | undefined) {
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_readSelfAction::readSelfAction)
  // The OutputPin on which the context object is placed.
  if (!result) {
    return
  }
  readSelfAction.model.addEdge('result', readSelfAction, result)
}
