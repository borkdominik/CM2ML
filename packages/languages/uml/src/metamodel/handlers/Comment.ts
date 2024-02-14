import type { GraphNode } from '@cm2ml/ir'

import { setBodyAttribute } from '../resolvers/body'
import { resolveFromAttribute } from '../resolvers/resolve'
import { Comment } from '../uml-metamodel'

export const CommentHandler = Comment.createHandler(
  (comment, { onlyContainmentAssociations }) => {
    setBodyAttribute(comment)
    const annotatedElement = resolveFromAttribute(comment, 'annotatedElement')
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_annotatedElement(comment, annotatedElement)
  },
)

function addEdge_annotatedElement(comment: GraphNode, annotatedElement: GraphNode | undefined) {
  // TODO/Association
  // annotatedElement : Element [0..*] (opposite A_annotatedElement_comment::comment)
  // References the Element(s) being commented.
  if (!annotatedElement) {
    return
  }
  comment.model.addEdge('annotatedElement', comment, annotatedElement)
}
