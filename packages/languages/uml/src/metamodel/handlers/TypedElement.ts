import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { TypedElement } from '../uml-metamodel'

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
  const type = resolve(typedElement, 'type')
  if (type && !Uml.getType(type)) {
    // The type can be present without an actual type (e.g., <type xmi:idref="Object" />)
    // We remove those nodes since they don't relate to types of the metamodel
    typedElement.model.removeNode(type)
    return undefined
  }
  return type
}

function addEdge_type(typedElement: GraphNode, type: GraphNode | undefined) {
  if (!type) {
    return
  }
  typedElement.model.addEdge('type', typedElement, type)
}
