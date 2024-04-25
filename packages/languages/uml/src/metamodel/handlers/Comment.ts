import type { GraphNode } from '@cm2ml/ir'

import { setBodyAttribute } from '../resolvers/body'
import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Comment, Element } from '../uml-metamodel'

export const CommentHandler = Comment.createHandler(
  (comment, { onlyContainmentAssociations }) => {
    setBodyAttribute(comment)
    const annotatedElements = resolve(comment, 'annotatedElement', { many: true, type: Element })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_annotatedElement(comment, annotatedElements)
  },
  { [Uml.Attributes.body]: { type: 'string' } },
)

function addEdge_annotatedElement(comment: GraphNode, annotatedElements: GraphNode[]) {
  // annotatedElement : Element [0..*] (opposite A_annotatedElement_comment::comment)
  // References the Element(s) being commented.
  annotatedElements.forEach((annotatedElement) => {
    comment.model.addEdge('annotatedElement', comment, annotatedElement)
  })
}
