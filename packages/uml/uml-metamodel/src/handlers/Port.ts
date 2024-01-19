import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { Port } from '../uml-metamodel'

export const PortHandler = Port.createHandler(
  (port, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_protocol(port)
    addEdge_provivded(port)
    addEdge_redefinedPort(port)
    addEdge_required(port)
  },
  {
    [Uml.Attributes.isBehavior]: 'false',
    [Uml.Attributes.isConjugated]: 'false',
    [Uml.Attributes.isService]: 'true',
  },
)

function addEdge_protocol(_port: GraphNode) {
  // TODO/Association
  // protocol: ProtocolStateMachine[0..1](opposite A_protocol_port::port)
  // An optional ProtocolStateMachine which describes valid interactions at this interaction point.
}

function addEdge_provivded(_port: GraphNode) {
  // TODO/Association
  // /provided : Interface [0..*]{} (opposite A_provided_port::port)
  // The Interfaces specifying the set of Operations and Receptions that the EncapsulatedClassifier offers to its environment via this Port, and which it will handle either directly or by forwarding it to a part of its internal structure.This association is derived according to the value of isConjugated.If isConjugated is false, provided is derived as the union of the sets of Interfaces realized by the type of the port and its supertypes, or directly from the type of the Port if the Port is typed by an Interface.If isConjugated is true, it is derived as the union of the sets of Interfaces used by the type of the Port and its supertypes.
}

function addEdge_redefinedPort(_port: GraphNode) {
  // TODO/Association
  // redefinedPort: Port[0..*]{subsets Property:: redefinedProperty } (opposite A_redefinedPort_port::port)
  // A Port may be redefined when its containing EncapsulatedClassifier is specialized.The redefining Port may have additional Interfaces to those that are associated with the redefined Port or it may replace an Interface by one of its subtypes.
}

function addEdge_required(_port: GraphNode) {
  // TODO/Association
  // /required : Interface [0..*]{} (opposite A_required_port::port)
  // The Interfaces specifying the set of Operations and Receptions that the EncapsulatedCassifier expects its environment to handle via this port. This association is derived according to the value of isConjugated. If isConjugated is false, required is derived as the union of the sets of Interfaces used by the type of the Port and its supertypes. If isConjugated is true, it is derived as the union of the sets of Interfaces realized by the type of the Port and its supertypes, or directly from the type of the Port if the Port is typed by an Interface.
}
