import type { GraphNode } from '@cm2ml/ir'

import { resolveFromChild } from '../resolvers/resolve'
import { Uml } from '../uml'
import { TimeEvent, TimeExpression } from '../uml-metamodel'

export const TimeEventHandler = TimeEvent.createHandler(
  (timeEvent, { onlyContainmentAssociations }) => {
    const when = resolveFromChild(timeEvent, 'when', { type: TimeExpression })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_when(timeEvent, when)
  },
  {
    [Uml.Attributes.isRelative]: 'false',
  },
)

function addEdge_when(timeEvent: GraphNode, when: GraphNode | undefined) {
  // TODO/Association
  // ♦ when : TimeExpression [1..1]{subsets Element::ownedElement} (opposite A_when_timeEvent::timeEvent)
  // Specifies the time of the TimeEvent.
  if (!when) {
    return
  }
  timeEvent.model.addEdge('when', timeEvent, when)
}
