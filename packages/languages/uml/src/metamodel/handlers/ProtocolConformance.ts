import type { GraphNode } from '@cm2ml/ir'

import { addEdge_relatedElement } from '../resolvers/relatedElement'
import { ProtocolConformance } from '../uml-metamodel'

export const ProtocolConformanceHandler = ProtocolConformance.createHandler(
  (protocolConformance, { onlyContainmentAssociations }) => {
    // TODO/Association
    const generalMachine = undefined
    // TODO/Association
    const specificMachine = undefined
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_generalMachine(protocolConformance, generalMachine)
    addEdge_specificMachine(protocolConformance, specificMachine)
    addEdge_relatedElement(protocolConformance, generalMachine, specificMachine)
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
}

function addEdge_specificMachine(protocolConformance: GraphNode, specificMachine: GraphNode | undefined) {
  // specificMachine : ProtocolStateMachine [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite ProtocolStateMachine::conformance)
  // Specifies the ProtocolStateMachine which conforms to the general ProtocolStateMachine.
  if (!specificMachine) {
    return
  }
  protocolConformance.model.addEdge('specificMachine', protocolConformance, specificMachine)
  protocolConformance.model.addEdge('source', protocolConformance, specificMachine)
}
