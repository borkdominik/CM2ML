import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { ObjectNode } from '../uml-metamodel'

export const ObjectNodeHandler = ObjectNode.createHandler(
  (objectNode, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_inState(objectNode)
    addEdge_selection(objectNode)
    addEdge_upperBound(objectNode)
  },
  {
    [Uml.Attributes.isControlType]: 'false',
    [Uml.Attributes.ordering]: 'FIFO',
  },
)

function addEdge_inState(_objectNode: GraphNode) {
  // TODO/Association
  // inState : State [0..*] (opposite A_inState_objectNode::objectNode)
  // The States required to be associated with the values held by tokens on this ObjectNode.
}

function addEdge_selection(_objectNode: GraphNode) {
  // TODO/Association
  // selection : Behavior [0..1] (opposite A_selection_objectNode::objectNode)
  // A Behavior used to select tokens to be offered on outgoing ActivityEdges.
}

function addEdge_upperBound(_objectNode: GraphNode) {
  // TODO/Association
  // ♦ upperBound : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_upperBound_objectNode::objectNode)
  // The maximum number of tokens that may be held by this ObjectNode. Tokens cannot flow into the ObjectNode if the upperBound is reached. If no upperBound is specified, then there is no limit on how many tokens the ObjectNode can hold.
}
