import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ConnectableElement, ConnectorEnd } from '../uml-metamodel'

export const ConnectableElementHandler = ConnectableElement.createHandler(
  (connectableElement, { onlyContainmentAssociations }) => {
    const ends = resolve(connectableElement, 'end', { many: true, type: ConnectorEnd })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_end(connectableElement, ends)
    addEdge_templateParameter(connectableElement)
  },
)

function addEdge_end(connectableElement: GraphNode, ends: GraphNode[]) {
  // /end : ConnectorEnd [0..*]{} (opposite ConnectorEnd::role)
  // A set of ConnectorEnds that attach to this ConnectableElement.
  ends.forEach((end) => {
    connectableElement.model.addEdge('end', connectableElement, end)
  })
}

function addEdge_templateParameter(_connectableElement: GraphNode) {
  // TODO/Association
  // templateParameter : ConnectableElementTemplateParameter [0..1]{redefines ParameterableElement::templateParameter} (opposite ConnectableElementTemplateParameter::parameteredElement )
  // The ConnectableElementTemplateParameter for this ConnectableElement parameter.
}
