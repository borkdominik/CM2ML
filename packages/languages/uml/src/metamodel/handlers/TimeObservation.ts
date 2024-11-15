import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { NamedElement, TimeObservation } from '../uml-metamodel'

export const TimeObservationHandler = TimeObservation.createHandler(
  (timeObservation, { onlyContainmentAssociations }) => {
    const event = resolve(timeObservation, 'event', { type: NamedElement })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_event(timeObservation, event)
  },
  {
    [Uml.Attributes.firstEvent]: { type: 'boolean', defaultValue: 'true' },
  },
)

function addEdge_event(timeObservation: GraphNode, event: GraphNode | undefined) {
  // event : NamedElement [1..1] (opposite A_event_timeObservation::timeObservation)
  // The TimeObservation is determined by the entering or exiting of the event Element during execution.
  if (!event) {
    return
  }
  timeObservation.model.addEdge('event', timeObservation, event)
}
