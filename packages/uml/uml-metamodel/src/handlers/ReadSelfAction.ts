import type { GraphNode } from '@cm2ml/ir'

import { ReadSelfAction } from '../uml-metamodel'

export const ReadSelfActionHandler = ReadSelfAction.createHandler(
  (readSelfAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_result(readSelfAction)
  },
)

function addEdge_result(_readSelfAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_readSelfAction::readSelfAction)
  // The OutputPin on which the context object is placed.
}
