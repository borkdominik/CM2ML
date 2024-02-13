import type { GraphNode } from '@cm2ml/ir'

import { ConnectableElementTemplateParameter } from '../uml-metamodel'

export const ConnectableElementTemplateParameterHandler =
  ConnectableElementTemplateParameter.createHandler(
    (connectableElementTemplateParameter, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_parameteredElement(connectableElementTemplateParameter)
    },
  )

function addEdge_parameteredElement(
  _connectableElementTemplateParameter: GraphNode,
) {
  // TODO
  // parameteredElement: ConnectableElement[1..1]{redefines TemplateParameter:: parameteredElement } (opposite ConnectableElement::templateParameter)
  // The ConnectableElement for this ConnectableElementTemplateParameter.
}
