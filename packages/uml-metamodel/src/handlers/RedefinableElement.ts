import type { GraphNode } from '@cm2ml/ir'

import { RedefinableElement } from '../uml-metamodel'

export const RedefinableElementHandler = RedefinableElement.createHandler(
  (redefinableElement, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_redefinedElement(redefinableElement)
    addEdge_redefinitionContext(redefinableElement)
  },
)

function addEdge_redefinedElement(_redefinableElement: GraphNode) {
  // TODO
  // /redefinedElement : RedefinableElement [0..*]{union} (opposite A_redefinedElement_redefinableElement::redefinableElement )
  // The RedefinableElement that is being redefined by this element.
}

function addEdge_redefinitionContext(_redefinableElement: GraphNode) {
  // TODO
  // /redefinitionContext : Classifier [0..*]{union} (opposite A_redefinitionContext_redefinableElement::redefinableElement )
  // The contexts that this element may be redefined from.
}
