import type { GraphNode } from '@cm2ml/ir'

import { Connector } from '../uml-metamodel'

export const ConnectorHandler = Connector.createHandler(
  (connector, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_contract(connector)
    addEdge_end(connector)
    addEdge_redefinedConnector(connector)
    addEdge_type(connector)
  },
)

function addEdge_contract(_connector: GraphNode) {
  // TODO
  // contract: Behavior[0..*](opposite A_contract_connector:: connector)
  // The set of Behaviors that specify the valid interaction patterns across the Connector.
}

function addEdge_end(_connector: GraphNode) {
  // TODO
  // ♦ end: ConnectorEnd[2..*]{ ordered, subsets Element:: ownedElement } (opposite A_end_connector::connector)
  // A Connector has at least two ConnectorEnds, each representing the participation of instances of the Classifiers typing the ConnectableElements attached to the end.The set of ConnectorEnds is ordered.
}

function addEdge_redefinedConnector(_connector: GraphNode) {
  // TODO
  // redefinedConnector: Connector[0..*]{subsets RedefinableElement:: redefinedElement } (opposite A_redefinedConnector_connector::connector)
  // A Connector may be redefined when its containing Classifier is specialized.The redefining Connector may have a type that specializes the type of the redefined Connector.The types of the ConnectorEnds of the redefining Connector may specialize the types of the ConnectorEnds of the redefined Connector.The properties of the ConnectorEnds of the redefining Connector may be replaced.
}

function addEdge_type(_connector: GraphNode) {
  // TODO
  // type: Association[0..1](opposite A_type_connector::connector)
  // An optional Association that classifies links corresponding to this Connector.
}