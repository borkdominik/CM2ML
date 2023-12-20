import type { GraphNode } from '@cm2ml/ir'

import { ConnectableElement } from '../metamodel'

export const ConnectableElementHandler = ConnectableElement.createHandler(
  (connectableElement) => {
    addEdge_end(connectableElement)
    addEdge_templateParameter(connectableElement)
  },
)

function addEdge_end(_connectableElement: GraphNode) {
  // TODO
  // /end : ConnectorEnd [0..*]{} (opposite ConnectorEnd::role)
  // A set of ConnectorEnds that attach to this ConnectableElement.
}

function addEdge_templateParameter(_connectableElement: GraphNode) {
  // TODO
  // templateParameter : ConnectableElementTemplateParameter [0..1]{redefines ParameterableElement::templateParameter} (opposite ConnectableElementTemplateParameter::parameteredElement )
  // The ConnectableElementTemplateParameter for this ConnectableElement parameter.
}
