import type { GraphNode } from '@cm2ml/ir'

import { resolve, resolveFromAttribute } from '../resolvers/resolve'
import { Trigger } from '../uml-metamodel'

export const TriggerHandler = Trigger.createHandler(
  (trigger, { onlyContainmentAssociations }) => {
    const event = resolveFromAttribute(trigger, 'event')
    const ports = resolve(trigger, 'port', { many: true })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_event(trigger, event)
    addEdge_port(trigger, ports)
  },
)

function addEdge_event(trigger: GraphNode, event: GraphNode | undefined) {
  // event : Event [1..1] (opposite A_event_trigger::trigger)
  // The Event that detected by the Trigger.
  if (!event) {
    return
  }
  trigger.model.addEdge('event', trigger, event)
}

function addEdge_port(trigger: GraphNode, ports: GraphNode[]) {
  // port : Port [0..*] (opposite A_port_trigger::trigger)
  // A optional Port of through which the given effect is detected.
  ports.forEach((port) => {
    trigger.model.addEdge('port', trigger, port)
  })
}
