import type { GraphNode } from '@cm2ml/ir'

import { OperationTemplateParameter } from '../uml-metamodel'

export const OperationTemplateParameterHandler =
  OperationTemplateParameter.createHandler(
    (operationTemplateParameter, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_operation(operationTemplateParameter)
    },
  )

function addEdge_operation(_operationTemplateParameter: GraphNode) {
  // TODO/Association
  // parameteredElement : Operation [1..1]{redefines TemplateParameter::parameteredElement} (opposite Operation::templateParameter)
  // The Operation exposed by this OperationTemplateParameter.
}
