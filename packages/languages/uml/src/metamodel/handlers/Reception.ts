import type { GraphNode } from '@cm2ml/ir'

import { Reception } from '../uml-metamodel'

export const ReceptionHandler = Reception.createHandler(
  (reception, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_signal(reception)
  },
)

function addEdge_signal(_reception: GraphNode) {
  // TODO/Association
  // signal : Signal [1..1] (opposite A_signal_reception::reception)
  // The Signal that this Reception handles.
}
