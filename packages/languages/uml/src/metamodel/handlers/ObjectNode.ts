import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Behavior, ObjectNode, State } from '../uml-metamodel'

export const ObjectNodeHandler = ObjectNode.createHandler(
  (objectNode, { onlyContainmentAssociations }) => {
    const selection = resolve(objectNode, 'selection', { type: Behavior })
    const inStates = resolve(objectNode, 'inState', { many: true, type: State })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_inState(objectNode, inStates)
    addEdge_selection(objectNode, selection)
    addEdge_upperBound(objectNode)
  },
  {
    [Uml.Attributes.isControlType]: { type: 'boolean', defaultValue: 'false' },
    [Uml.Attributes.ordering]: { type: 'category', defaultValue: 'FIFO' },
  },
)

function addEdge_inState(objectNode: GraphNode, inStates: GraphNode[]) {
  // inState : State [0..*] (opposite A_inState_objectNode::objectNode)
  // The States required to be associated with the values held by tokens on this ObjectNode.
  inStates.forEach((inState) => {
    objectNode.model.addEdge('inState', objectNode, inState)
  })
}

function addEdge_selection(objectNode: GraphNode, selection: GraphNode | undefined) {
  // selection : Behavior [0..1] (opposite A_selection_objectNode::objectNode)
  // A Behavior used to select tokens to be offered on outgoing ActivityEdges.
  if (!selection) {
    return
  }
  objectNode.model.addEdge('selection', objectNode, selection)
}

function addEdge_upperBound(_objectNode: GraphNode) {
  // TODO/Association
  // ♦ upperBound : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_upperBound_objectNode::objectNode)
  // The maximum number of tokens that may be held by this ObjectNode. Tokens cannot flow into the ObjectNode if the upperBound is reached. If no upperBound is specified, then there is no limit on how many tokens the ObjectNode can hold.
}
