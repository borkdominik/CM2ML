import type { GraphNode } from '@cm2ml/ir'

import { ReadLinkObjectEndQualifierAction } from '../uml-metamodel'

export const ReadLinkObjectEndQualifierActionHandler =
  ReadLinkObjectEndQualifierAction.createHandler(
    (readLinkObjectEndQualifierAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_object(readLinkObjectEndQualifierAction)
      addEdge_qualifier(readLinkObjectEndQualifierAction)
      addEdge_result(readLinkObjectEndQualifierAction)
    },
  )
function addEdge_object(_readLinkObjectEndQualifierAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_readLinkObjectEndQualifierAction::readLinkObjectEndQualifierAction )
  // The InputPin from which the link object is obtained.
}

function addEdge_qualifier(_readLinkObjectEndQualifierAction: GraphNode) {
  // TODO/Association
  // qualifier : Property [1..1] (opposite A_qualifier_readLinkObjectEndQualifierAction::readLinkObjectEndQualifierAction )
  // The qualifier Property to be read.
}

function addEdge_result(_readLinkObjectEndQualifierAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_readLinkObjectEndQualifierAction::readLinkObjectEndQualifierAction )
  // The OutputPin where the result value is placed.
}
