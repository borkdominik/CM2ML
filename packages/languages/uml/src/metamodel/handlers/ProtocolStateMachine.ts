import type { GraphNode } from '@cm2ml/ir'

import { ProtocolStateMachine } from '../uml-metamodel'

export const ProtocolStateMachineHandler = ProtocolStateMachine.createHandler(
  (protocolStateMachine, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_conformance(protocolStateMachine)
  },
)

function addEdge_conformance(_protocolStateMachine: GraphNode) {
  // TODO/Association
  // ♦ conformance : ProtocolConformance [0..*]{subsets Element::ownedElement, subsets A_source_directedRelationship::directedRelationship} (opposite ProtocolConformance::specificMachine)
  // Conformance between ProtocolStateMachine
}
