import type { GraphNode } from '@cm2ml/ir'

import { Element } from '../archimate-metamodel'


export const ElementHandler = Element.createHandler(
    (element) => {
      addEdge_owner(element)
      element.children.forEach((child) => {
        addEdge_ownedElement(element, child)
      })
    },
  )

function addEdge_owner(element: GraphNode) {
  const parent = element.parent
  if (!parent) {
    return
  }
  if (!Element.isAssignable(element)) {
    throw new Error('Parent of element is no element')
  }
  element.model.addEdge('owner', element, parent)
}

function addEdge_ownedElement(element: GraphNode, child: GraphNode) {
  if (Element.isAssignable(child)) {
    element.model.addEdge('ownedElement', element, child)
  }
}
