import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { InputPin, LinkAction } from '../uml-metamodel'

export const LinkActionHandler = LinkAction.createHandler(
  (linkAction, { onlyContainmentAssociations }) => {
    const inputValues = resolve(linkAction, 'inputValue', { many: true, type: InputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_endData(linkAction)
    addEdge_inputValue(linkAction, inputValues)
  },
)

function addEdge_endData(_linkAction: GraphNode) {
  // TODO/Association
  // ♦ endData : LinkEndData [2..*]{subsets Element::ownedElement} (opposite A_endData_linkAction::linkAction)
  // The LinkEndData identifying the values on the ends of the links acting on by this LinkAction.
}

function addEdge_inputValue(linkAction: GraphNode, inputValues: GraphNode[]) {
  // ♦ inputValue : InputPin [1..*]{subsets Action::input} (opposite A_inputValue_linkAction::linkAction)
  // InputPins used by the LinkEndData of the LinkAction.
  inputValues.forEach((inputValue) => {
    linkAction.model.addEdge('inputValue', linkAction, inputValue)
  })
}
