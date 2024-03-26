import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ConnectableElement, ConnectableElementTemplateParameter } from '../uml-metamodel'

export const ConnectableElementTemplateParameterHandler =
  ConnectableElementTemplateParameter.createHandler(
    (connectableElementTemplateParameter, { onlyContainmentAssociations }) => {
      const parameteredElement = resolve(connectableElementTemplateParameter, 'parameteredElement', { type: ConnectableElement })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_parameteredElement(connectableElementTemplateParameter, parameteredElement)
    },
  )

function addEdge_parameteredElement(
  connectableElementTemplateParameter: GraphNode,
  parameteredElement: GraphNode | undefined,
) {
  // parameteredElement: ConnectableElement[1..1]{redefines TemplateParameter:: parameteredElement } (opposite ConnectableElement::templateParameter)
  // The ConnectableElement for this ConnectableElementTemplateParameter.
  if (!parameteredElement) {
    return
  }
  connectableElementTemplateParameter.model.addEdge('parameteredElement', connectableElementTemplateParameter, parameteredElement)
}
