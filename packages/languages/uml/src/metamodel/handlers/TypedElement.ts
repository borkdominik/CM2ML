import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Type, TypedElement } from '../uml-metamodel'

export const TypedElementHandler = TypedElement.createHandler(
  (typedElement, { onlyContainmentAssociations }) => {
    const type = getType(typedElement)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_type(typedElement, type)
  },
)

function getType(typedElement: GraphNode) {
  const type = resolve(typedElement, 'type', { type: Type })
  if (!type || Uml.getType(type) !== undefined) {
    return type
  }
  type.model.removeNode(type)
  return undefined
}

function addEdge_type(typedElement: GraphNode, type: GraphNode | undefined) {
  // type : Type [0..1] (opposite A_type_typedElement::typedElement)
  if (!type) {
    return
  }
  typedElement.model.addEdge('type', typedElement, type)
}
