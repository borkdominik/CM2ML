import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import { TypedElement } from '../metamodel'

export const TypedElementHandler = TypedElement.createHandler(
  (typedElement, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_type(typedElement)
  },
)

function addEdge_type(typedElement: GraphNode) {
  const type = typedElement.getAttribute(Uml.Attributes.type)?.value.literal
  if (type === undefined) {
    return
  }
  const resolvedType = typedElement.model.getNodeById(type)
  if (!resolvedType) {
    return
  }
  typedElement.model.addEdge('type', typedElement, resolvedType)
}
