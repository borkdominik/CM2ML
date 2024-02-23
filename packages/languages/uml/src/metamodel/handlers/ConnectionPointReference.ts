import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ConnectionPointReference } from '../uml-metamodel'

export const ConnectionPointReferenceHandler =
  ConnectionPointReference.createHandler(
    (connectionPointReference, { onlyContainmentAssociations }) => {
      const entry = resolve(connectionPointReference, 'entry')
      const exit = resolve(connectionPointReference, 'exit')
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_entry(connectionPointReference, entry)
      addEdge_exit(connectionPointReference, exit)
      addEdge_state(connectionPointReference)
    },
  )

function addEdge_entry(connectionPointReference: GraphNode, entry: GraphNode | undefined) {
  // entry : Pseudostate [0..*] (opposite A_entry_connectionPointReference::connectionPointReference)
  // The entryPoint Pseudostates corresponding to this connection point.
  if (!entry) {
    return
  }
  connectionPointReference.model.addEdge('entry', connectionPointReference, entry)
}

function addEdge_exit(connectionPointReference: GraphNode, exit: GraphNode | undefined) {
  // exit : Pseudostate [0..*] (opposite A_exit_connectionPointReference::connectionPointReference)
  // The exitPoints kind Pseudostates corresponding to this connection point.
  if (!exit) {
    return
  }
  connectionPointReference.model.addEdge('exit', connectionPointReference, exit)
}

function addEdge_state(_connectionPointReference: GraphNode) {
  // TODO/Association
  // state : State [0..1]{subsets NamedElement::namespace} (opposite State::connection)
  // The State in which the ConnectionPointReference is defined.
}
