import type { GraphNode } from '@cm2ml/ir'

import { ProtocolConformance } from '../uml-metamodel'

export const ProtocolConformanceHandler = ProtocolConformance.createHandler(
  (protocolConformance, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_generalMachine(protocolConformance)
    addEdge_specificMachine(protocolConformance)
  },
)

function addEdge_generalMachine(_protocolConformance: GraphNode) {
  // TODO/Association
  // generalMachine : ProtocolStateMachine [1..1]{subsets DirectedRelationship::target} (opposite A_generalMachine_protocolConformance::protocolConformance)
  // Specifies the ProtocolStateMachine to which the specific ProtocolStateMachine conforms.
}

function addEdge_specificMachine(_protocolConformance: GraphNode) {
  // TODO/Association
  // specificMachine : ProtocolStateMachine [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite ProtocolStateMachine::conformance)
  // Specifies the ProtocolStateMachine which conforms to the general ProtocolStateMachine.
}
