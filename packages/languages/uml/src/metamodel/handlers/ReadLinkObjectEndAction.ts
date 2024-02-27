import type { GraphNode } from '@cm2ml/ir'

import { ReadLinkObjectEndAction } from '../uml-metamodel'

export const ReadLinkObjectEndActionHandler =
  ReadLinkObjectEndAction.createHandler(
    (readLinkObjectEndAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_end(readLinkObjectEndAction)
      addEdge_object(readLinkObjectEndAction)
      addEdge_result(readLinkObjectEndAction)
    },
  )

function addEdge_end(_readLinkObjectEndAction: GraphNode) {
  // TODO/Association
  // end : Property [1..1] (opposite A_end_readLinkObjectEndAction::readLinkObjectEndAction)
  // The Association end to be read.
}

function addEdge_object(_readLinkObjectEndAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_readLinkObjectEndAction::readLinkObjectEndAction)
  // The input pin from which the link object is obtained.
}

function addEdge_result(_readLinkObjectEndAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_readLinkObjectEndAction::readLinkObjectEndAction)
  // The OutputPin where the result value is placed.
}
