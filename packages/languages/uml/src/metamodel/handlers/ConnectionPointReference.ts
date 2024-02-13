import type { GraphNode } from '@cm2ml/ir'

import { ConnectionPointReference } from '../uml-metamodel'

export const ConnectionPointReferenceHandler =
  ConnectionPointReference.createHandler(
    (connectionPointReference, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_entry(connectionPointReference)
      addEdge_exit(connectionPointReference)
      addEdge_state(connectionPointReference)
    },
  )

function addEdge_entry(_connectionPointReference: GraphNode) {
  // TODO/Association
  // entry : Pseudostate [0..*] (opposite A_entry_connectionPointReference::connectionPointReference)
  // The entryPoint Pseudostates corresponding to this connection point.
}

function addEdge_exit(_connectionPointReference: GraphNode) {
  // TODO/Association
  // exit : Pseudostate [0..*] (opposite A_exit_connectionPointReference::connectionPointReference)
  // The exitPoints kind Pseudostates corresponding to this connection point.
}

function addEdge_state(_connectionPointReference: GraphNode) {
  // TODO/Association
  // state : State [0..1]{subsets NamedElement::namespace} (opposite State::connection)
  // The State in which the ConnectionPointReference is defined.
}
