import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { AcceptEventAction } from '../uml-metamodel'

export const AcceptEventActionHandler = AcceptEventAction.createHandler(
  (acceptEventAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_result(acceptEventAction)
    addEdge_trigger(acceptEventAction)
  },
  {
    [Uml.Attributes.isUnmarshall]: 'false',
  },
)

function addEdge_result(_acceptEventAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [0..*]{ordered, subsets Action::output} (opposite A_result_acceptEventAction::acceptEventAction)
  // OutputPins holding the values received from an Event occurrence.
}

function addEdge_trigger(_acceptEventAction: GraphNode) {
  // TODO/Association
  // ♦ trigger : Trigger [1..*]{subsets Element::ownedElement} (opposite A_trigger_acceptEventAction::acceptEventAction)
  // The Triggers specifying the Events of which the AcceptEventAction waits for occurrences.
}
