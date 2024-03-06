import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Operation, OperationTemplateParameter } from '../uml-metamodel'

export const OperationTemplateParameterHandler =
  OperationTemplateParameter.createHandler(
    (operationTemplateParameter, { onlyContainmentAssociations }) => {
      const parameteredElement = resolve(operationTemplateParameter, 'parameteredElement', { type: Operation })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_parameteredElement(operationTemplateParameter, parameteredElement)
    },
  )

function addEdge_parameteredElement(operationTemplateParameter: GraphNode, parameteredElement: GraphNode | undefined) {
  // parameteredElement : Operation [1..1]{redefines TemplateParameter::parameteredElement} (opposite Operation::templateParameter)
  // The Operation exposed by this OperationTemplateParameter.
  if (!parameteredElement) {
    return
  }
  operationTemplateParameter.model.addEdge('parameteredElement', operationTemplateParameter, parameteredElement)
}
