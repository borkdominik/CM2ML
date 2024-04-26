import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { Uml } from '../uml'

function resolveBodies(node: GraphNode) {
  const bodyChildren = node.findAllChildren((child) => child.tag === 'body')
  return Stream.from(bodyChildren).forEach((body) => {
    node.model.removeNode(body)
  }).map((body) => body.getAttribute(Uml.Attributes.body)?.value.literal).filterNonNull()
}

/**
 * Sets the `body` attribute of a node to the combined bodies of all its `body` children.
 */
export function setBodyAttribute(node: GraphNode) {
  const body = resolveBodies(node).join('\n').trim()
  if (!body) {
    return
  }
  node.addAttribute({ name: Uml.Attributes.body, type: 'string', value: { literal: body } })
}
