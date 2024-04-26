import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Association, Connector, ConnectorEnd } from '../uml-metamodel'

export const ConnectorHandler = Connector.createHandler(
  (connector, { onlyContainmentAssociations }) => {
    const ends = resolve(connector, 'end', { many: true, type: ConnectorEnd })
    const type = resolve(connector, 'type', { type: Association })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_contract(connector)
    addEdge_end(connector, ends)
    addEdge_redefinedConnector(connector)
    addEdge_type(connector, type)
  },
  {
    // TODO/Jan: Implement derived attribute
    // Indicates the kind of Connector.
    // This is derived: a Connector with one or more ends connected to a Port
    // which is not on a Part and which is not a behavior port is a `delegation`;
    // otherwise it is an `assembly`.
    [Uml.Attributes.kind]: { type: 'category' },
  },
)

function addEdge_contract(_connector: GraphNode) {
  // TODO/Association
  // contract: Behavior[0..*](opposite A_contract_connector:: connector)
  // The set of Behaviors that specify the valid interaction patterns across the Connector.
}

function addEdge_end(connector: GraphNode, ends: GraphNode[]) {
  // ♦ end: ConnectorEnd[2..*]{ ordered, subsets Element:: ownedElement } (opposite A_end_connector::connector)
  // A Connector has at least two ConnectorEnds, each representing the participation of instances of the Classifiers typing the ConnectableElements attached to the end.The set of ConnectorEnds is ordered.
  ends.forEach((end) => {
    connector.model.addEdge('end', connector, end)
  })
}

function addEdge_redefinedConnector(_connector: GraphNode) {
  // TODO/Association
  // redefinedConnector: Connector[0..*]{subsets RedefinableElement:: redefinedElement } (opposite A_redefinedConnector_connector::connector)
  // A Connector may be redefined when its containing Classifier is specialized.The redefining Connector may have a type that specializes the type of the redefined Connector.The types of the ConnectorEnds of the redefining Connector may specialize the types of the ConnectorEnds of the redefined Connector.The properties of the ConnectorEnds of the redefining Connector may be replaced.
}

function addEdge_type(connector: GraphNode, type: GraphNode | undefined) {
  // type: Association[0..1](opposite A_type_connector::connector)
  // An optional Association that classifies links corresponding to this Connector.
  if (!type) {
    return
  }
  connector.model.addEdge('type', connector, type)
}
