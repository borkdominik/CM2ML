import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Comment, Element } from '../uml-metamodel'

export const ElementHandler = Element.createHandler(
  (element, { onlyContainmentAssociations }) => {
    addEdge_owner(element)
    addEdge_ownedElement(element)
    const ownedComments = resolve(element, 'ownedComment', { many: true, type: Comment })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_ownedComment(element, ownedComments)
  },
)

function addEdge_owner(element: GraphNode) {
  // /owner : Element [0..1]{union} (opposite Element::ownedElement)
  // The Element that owns this Element.
  const parent = element.parent
  if (!parent) {
    return
  }
  element.model.addEdge('owner', element, parent)
  parent.model.addEdge('ownedElement', parent, element)
}

function addEdge_ownedElement(_element: GraphNode) {
  // ♦ /ownedElement : Element [0..*]{union} (opposite Element::owner)
  // The Elements owned by this Element.

  // Added by ElementHandler::addEdge_owner
}

function addEdge_ownedComment(element: GraphNode, ownedComments: GraphNode[]) {
  // ♦ ownedComment : Comment [0..*]{subsets Element::ownedElement} (opposite A_ownedComment_owningElement::owningElement)
  // The Comments owned by this Element.
  ownedComments.forEach((ownedComment) => {
    element.model.addEdge('ownedComment', element, ownedComment)
  })
}
