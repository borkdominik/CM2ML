import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { AcceptEventAction, OutputPin, Trigger } from '../uml-metamodel'

export const AcceptEventActionHandler = AcceptEventAction.createHandler(
  (acceptEventAction, { onlyContainmentAssociations }) => {
    const results = resolve(acceptEventAction, 'result', { many: true, type: OutputPin })
    const triggers = resolve(acceptEventAction, 'trigger', { many: true, type: Trigger })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_result(acceptEventAction, results)
    addEdge_trigger(acceptEventAction, triggers)
  },
  {
    [Uml.Attributes.isUnmarshall]: { type: 'boolean', defaultValue: 'false' },
  },
)

function addEdge_result(acceptEventAction: GraphNode, results: GraphNode[]) {
  // ♦ result : OutputPin [0..*]{ordered, subsets Action::output} (opposite A_result_acceptEventAction::acceptEventAction)
  // OutputPins holding the values received from an Event occurrence.
  results.forEach((result) => {
    acceptEventAction.model.addEdge('result', acceptEventAction, result)
  })
}

function addEdge_trigger(acceptEventAction: GraphNode, triggers: GraphNode[]) {
  // ♦ trigger : Trigger [1..*]{subsets Element::ownedElement} (opposite A_trigger_acceptEventAction::acceptEventAction)
  // The Triggers specifying the Events of which the AcceptEventAction waits for occurrences.
  triggers.forEach((trigger) => {
    acceptEventAction.model.addEdge('trigger', acceptEventAction, trigger)
  })
}
