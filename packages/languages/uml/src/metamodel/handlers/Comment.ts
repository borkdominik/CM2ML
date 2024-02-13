import type { GraphNode } from '@cm2ml/ir'

import { setBodyAttribute } from '../resolvers/body'
import { Comment } from '../uml-metamodel'

export const CommentHandler = Comment.createHandler(
  (comment, { onlyContainmentAssociations }) => {
    setBodyAttribute(comment)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_annotatedElement(comment)
  },
)

function addEdge_annotatedElement(_comment: GraphNode) {
  // TODO/Association
  // annotatedElement : Element [0..*] (opposite A_annotatedElement_comment::comment)
  // References the Element(s) being commented.
}
