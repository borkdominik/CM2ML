import type { GraphNode } from '@cm2ml/ir'

import { ProtocolConformance } from '../uml-metamodel'

export const ProtocolConformanceHandler = ProtocolConformance.createHandler(
  (protocolConformance, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    // TODO/Association
    addEdge_generalMachine(protocolConformance, undefined)
    // TODO/Association
    addEdge_specificMachine(protocolConformance, undefined)
  },
)

function addEdge_generalMachine(protocolConformance: GraphNode, generalMachine: GraphNode | undefined) {
  // generalMachine : ProtocolStateMachine [1..1]{subsets DirectedRelationship::target} (opposite A_generalMachine_protocolConformance::protocolConformance)
  // Specifies the ProtocolStateMachine to which the specific ProtocolStateMachine conforms.
  if (!generalMachine) {
    return
  }
  protocolConformance.model.addEdge('generalMachine', protocolConformance, generalMachine)
  protocolConformance.model.addEdge('target', protocolConformance, generalMachine)
  protocolConformance.model.addEdge('relatedElement', protocolConformance, generalMachine)
}

function addEdge_specificMachine(protocolConformance: GraphNode, specificMachine: GraphNode | undefined) {
  // specificMachine : ProtocolStateMachine [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite ProtocolStateMachine::conformance)
  // Specifies the ProtocolStateMachine which conforms to the general ProtocolStateMachine.
  if (!specificMachine) {
    return
  }
  protocolConformance.model.addEdge('specificMachine', protocolConformance, specificMachine)
  protocolConformance.model.addEdge('source', protocolConformance, specificMachine)
  protocolConformance.model.addEdge('relatedElement', protocolConformance, specificMachine)
}
