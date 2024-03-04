import type { GraphNode } from '@cm2ml/ir'

import { Comment, Element } from '../uml-metamodel'

export const ElementHandler = Element.createHandler(
  (element, { onlyContainmentAssociations }) => {
    addEdge_owner(element)
    element.children.forEach((child) => {
      addEdge_ownedElement(element, child)
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_ownedComment(element, child)
    })
  },
)

function addEdge_owner(element: GraphNode) {
  // /owner : Element [0..1]{union} (opposite Element::ownedElement)
  // The Element that owns this Element.
  const parent = element.parent
  if (!parent) {
    return
  }
  if (!Element.isAssignable(element)) {
    throw new Error('Parent of element is no element')
  }
  element.model.addEdge('owner', element, parent)
}

// TODO/Jan: Also set owner here
function addEdge_ownedElement(element: GraphNode, child: GraphNode) {
  // ♦ /ownedElement : Element [0..*]{union} (opposite Element::owner)
  // The Elements owned by this Element.
  if (Element.isAssignable(child)) {
    element.model.addEdge('ownedElement', element, child)
  }
}

// TODO/Jan: Use resolve?
function addEdge_ownedComment(element: GraphNode, child: GraphNode) {
  // ♦ ownedComment : Comment [0..*]{subsets Element::ownedElement} (opposite A_ownedComment_owningElement::owningElement)
  // The Comments owned by this Element.
  if (Comment.isAssignable(child)) {
    element.model.addEdge('ownedComment', element, child)
  }
}
