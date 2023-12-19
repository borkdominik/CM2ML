import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import { TypedElement } from '../metamodel'

export const TypedElementHandler = TypedElement.createHandler(
  (typedElement) => {
    addEdge_type(typedElement)
  },
)

function addEdge_type(typedElement: GraphNode) {
  const type = typedElement.getAttribute('type')?.value.literal
  if (type === undefined) {
    return
  }
  if (Uml.isValidType(type)) {
    return
  }
  const resolvedType = typedElement.model.getNodeById(type)
  if (!resolvedType) {
    return
  }
  typedElement.model.addEdge('type', typedElement, resolvedType)
}
