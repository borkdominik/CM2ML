import type { GraphNode } from '@cm2ml/ir'

import { Trigger } from '../uml-metamodel'

export const TriggerHandler = Trigger.createHandler(
  (trigger, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_event(trigger)
    addEdge_port(trigger)
  },
)

function addEdge_event(_trigger: GraphNode) {
  // TODO/Association
  // event : Event [1..1] (opposite A_event_trigger::trigger)
  // The Event that detected by the Trigger.
}

function addEdge_port(_trigger: GraphNode) {
  // TODO/Association
  // port : Port [0..*] (opposite A_port_trigger::trigger)
  // A optional Port of through which the given effect is detected.
}
