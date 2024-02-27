import type { GraphNode } from '@cm2ml/ir'

import { ReadLinkAction } from '../uml-metamodel'

export const ReadLinkActionHandler = ReadLinkAction.createHandler(
  (readLinkAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_result(readLinkAction)
  },
)

function addEdge_result(_readLinkAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_readLinkAction::readLinkAction)
  // The OutputPin on which the objects retrieved from the "open" end of those links whose values on other ends are given by the endData.
}
