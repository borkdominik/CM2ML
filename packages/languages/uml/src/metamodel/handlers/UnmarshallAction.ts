import type { GraphNode } from '@cm2ml/ir'

import { UnmarshallAction } from '../uml-metamodel'

export const UnmarshallActionHandler = UnmarshallAction.createHandler(
  (unmarshallAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_object(unmarshallAction)
    addEdge_result(unmarshallAction)
    addEdge_unmarshallType(unmarshallAction)
  },
)
function addEdge_object(_unmarshallAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_unmarshallAction::unmarshallAction)
  // The InputPin that gives the object to be unmarshalled.
}

function addEdge_result(_unmarshallAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..*]{ordered, subsets Action::output} (opposite A_result_unmarshallAction::unmarshallAction)
  // The OutputPins on which are placed the values of the StructuralFeatures of the input object.
}

function addEdge_unmarshallType(_unmarshallAction: GraphNode) {
  // TODO/Association
  // unmarshallType : Classifier [1..1] (opposite A_unmarshallType_unmarshallAction::unmarshallAction)
  // The type of the object to be unmarshalled.
}
