import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Reception, Signal } from '../uml-metamodel'

export const ReceptionHandler = Reception.createHandler(
  (reception, { onlyContainmentAssociations }) => {
    const signal = resolve(reception, 'signal', { type: Signal })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_signal(reception, signal)
  },
)

function addEdge_signal(reception: GraphNode, signal: GraphNode | undefined) {
  // signal : Signal [1..1] (opposite A_signal_reception::reception)
  // The Signal that this Reception handles.
  if (!signal) {
    return
  }
  reception.model.addEdge('signal', reception, signal)
}
