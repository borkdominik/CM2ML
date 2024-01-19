import type { GraphNode } from '@cm2ml/ir'

import { ConnectorEnd } from '../uml-metamodel'

export const ConnectorEndHandler = ConnectorEnd.createHandler(
  (connectorEnd, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_definingEnd(connectorEnd)
    addEdge_partWithPort(connectorEnd)
    addEdge_role(connectorEnd)
  },
)

function addEdge_definingEnd(_connectorEnd: GraphNode) {
  // TODO/Association
  // /definingEnd : Property [0..1]{} (opposite A_definingEnd_connectorEnd::connectorEnd)
  // A derived property referencing the corresponding end on the Association which types the Connector owing this ConnectorEnd, if any.It is derived by selecting the end at the same place in the ordering of Association ends as this ConnectorEnd.
}

function addEdge_partWithPort(_connectorEnd: GraphNode) {
  // TODO/Association
  // partWithPort: Property[0..1](opposite A_partWithPort_connectorEnd::connectorEnd)
  // Indicates the role of the internal structure of a Classifier with the Port to which the ConnectorEnd is attached.
}

function addEdge_role(_connectorEnd: GraphNode) {
  // TODO/Association
  // role: ConnectableElement[1..1](opposite ConnectableElement::end)
  // The ConnectableElement attached at this ConnectorEnd.When an instance of the containing Classifier is created, a link may(depending on the multiplicities) be created to an instance of the Classifier that types this ConnectableElement.
}
