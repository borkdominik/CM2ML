import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Trigger } from '../uml-metamodel'

export const TriggerHandler = Trigger.createHandler(
  (trigger, { onlyContainmentAssociations }) => {
    const event = resolveFromAttribute(trigger, 'event')
    const port = resolveFromAttribute(trigger, 'port')
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_event(trigger, event)
    addEdge_port(trigger, port)
  },
)

function addEdge_event(trigger: GraphNode, event: GraphNode | undefined) {
  // TODO/Association
  // event : Event [1..1] (opposite A_event_trigger::trigger)
  // The Event that detected by the Trigger.
  if (!event) {
    return
  }
  trigger.model.addEdge('event', trigger, event)
}

function addEdge_port(trigger: GraphNode, port: GraphNode | undefined) {
  // TODO/Association
  // port : Port [0..*] (opposite A_port_trigger::trigger)
  // A optional Port of through which the given effect is detected.
  if (!port) {
    return
  }
  trigger.model.addEdge('port', trigger, port)
}
