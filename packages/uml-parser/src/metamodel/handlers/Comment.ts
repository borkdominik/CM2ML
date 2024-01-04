import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import { Comment } from '../metamodel'

export const CommentHandler = Comment.createHandler(
  (comment, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addAttribute_body(comment)
  },
)

function addAttribute_body(comment: GraphNode) {
  const body = comment.findChild((child) => child.tag === Uml.Tags.body)
  if (!body) {
    return
  }
  comment.model.removeNode(body)
  const bodyText = body.getAttribute(Uml.Attributes.body)
  if (!bodyText) {
    return
  }
  comment.addAttribute({ name: Uml.Attributes.body, value: bodyText.value })
}
