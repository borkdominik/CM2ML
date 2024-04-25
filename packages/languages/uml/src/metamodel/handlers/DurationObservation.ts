import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { DurationObservation, NamedElement } from '../uml-metamodel'

export const DurationObservationHandler = DurationObservation.createHandler(
  (durationObservation, { onlyContainmentAssociations }) => {
    const events = resolve(durationObservation, 'event', { many: true, type: NamedElement })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_event(durationObservation, events)
  },
  {
    [Uml.Attributes.firstEvent]: { type: 'boolean' },
  },
)

function addEdge_event(durationObservation: GraphNode, events: GraphNode[]) {
  // event : NamedElement [1..2]{ordered} (opposite A_event_durationObservation::durationObservation)
  // The DurationObservation is determined as the duration between the entering or exiting of a single event Element during execution, or the entering/exiting of one event Element and the entering/exiting of a second.
  events.forEach((event) => {
    durationObservation.model.addEdge('event', durationObservation, event)
  })
}
