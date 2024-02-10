import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/fromAttribute'
import { Type, TypedElement } from '../uml-metamodel'

export const TypedElementHandler = TypedElement.createHandler(
  (typedElement, { onlyContainmentAssociations }) => {
    const type = resolveFromAttribute(typedElement, 'type', { type: Type })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_type(typedElement, type)
  },
)

function addEdge_type(typedElement: GraphNode, type: GraphNode | undefined) {
  if (!type) {
    return
  }
  typedElement.model.addEdge('type', typedElement, type)
}
