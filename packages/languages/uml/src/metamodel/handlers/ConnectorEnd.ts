import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { ConnectableElement, ConnectorEnd, Property } from '../uml-metamodel'

export const ConnectorEndHandler = ConnectorEnd.createHandler(
  (connectorEnd, { onlyContainmentAssociations }) => {
    const partWithPort = resolveFromAttribute(connectorEnd, 'partWithPort', { type: Property })
    const role = resolveFromAttribute(connectorEnd, 'role', { type: ConnectableElement })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_definingEnd(connectorEnd)
    addEdge_partWithPort(connectorEnd, partWithPort)
    addEdge_role(connectorEnd, role)
  },
)

function addEdge_definingEnd(_connectorEnd: GraphNode) {
  // TODO/Association
  // /definingEnd : Property [0..1]{} (opposite A_definingEnd_connectorEnd::connectorEnd)
  // A derived property referencing the corresponding end on the Association which types the Connector owing this ConnectorEnd, if any.It is derived by selecting the end at the same place in the ordering of Association ends as this ConnectorEnd.
}

function addEdge_partWithPort(connectorEnd: GraphNode, partWithPort: GraphNode | undefined) {
  // TODO/Association
  // partWithPort: Property[0..1](opposite A_partWithPort_connectorEnd::connectorEnd)
  // Indicates the role of the internal structure of a Classifier with the Port to which the ConnectorEnd is attached.
  if (!partWithPort) {
    return
  }
  connectorEnd.model.addEdge('partWithPort', connectorEnd, partWithPort)
}

function addEdge_role(connectorEnd: GraphNode, role: GraphNode | undefined) {
  // TODO/Association
  // role: ConnectableElement[1..1](opposite ConnectableElement::end)
  // The ConnectableElement attached at this ConnectorEnd.When an instance of the containing Classifier is created, a link may(depending on the multiplicities) be created to an instance of the Classifier that types this ConnectableElement.
  if (!role) {
    return
  }
  connectorEnd.model.addEdge('role', connectorEnd, role)
}
