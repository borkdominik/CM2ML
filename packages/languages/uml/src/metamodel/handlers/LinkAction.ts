import type { GraphNode } from '@cm2ml/ir'

import { LinkAction } from '../uml-metamodel'

export const LinkActionHandler = LinkAction.createHandler(
  (linkAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_endData(linkAction)
    addEdge_inputValue(linkAction)
  },
)

function addEdge_endData(_linkAction: GraphNode) {
  // TODO/Association
  // ♦ endData : LinkEndData [2..*]{subsets Element::ownedElement} (opposite A_endData_linkAction::linkAction)
  // The LinkEndData identifying the values on the ends of the links acting on by this LinkAction.
}

function addEdge_inputValue(_linkAction: GraphNode) {
  // TODO/Association
  // ♦ inputValue : InputPin [1..*]{subsets Action::input} (opposite A_inputValue_linkAction::linkAction)
  // InputPins used by the LinkEndData of the LinkAction.
}
