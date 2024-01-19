import type { GraphNode } from '@cm2ml/ir'

import { ConnectableElement } from '../uml-metamodel'

export const ConnectableElementHandler = ConnectableElement.createHandler(
  (connectableElement, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_end(connectableElement)
    addEdge_templateParameter(connectableElement)
  },
)

function addEdge_end(_connectableElement: GraphNode) {
  // TODO/Association
  // /end : ConnectorEnd [0..*]{} (opposite ConnectorEnd::role)
  // A set of ConnectorEnds that attach to this ConnectableElement.
}

function addEdge_templateParameter(_connectableElement: GraphNode) {
  // TODO/Association
  // templateParameter : ConnectableElementTemplateParameter [0..1]{redefines ParameterableElement::templateParameter} (opposite ConnectableElementTemplateParameter::parameteredElement )
  // The ConnectableElementTemplateParameter for this ConnectableElement parameter.
}
