import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { Uml } from '../uml'

function resolveBodies(node: GraphNode) {
  const bodyChildren = node.findAllChildren((child) => child.tag === 'body')
  return Stream.from(bodyChildren).forEach((body) => {
    node.model.removeNode(body)
  }).map((body) => body.getAttribute(Uml.Attributes.body))
}

export function setBodyAttribute(node: GraphNode) {
  // TODO/Jan: How to handle multiple bodies?
  const body = resolveBodies(node).join('\n').trim()
  if (!body) {
    return
  }
  node.addAttribute({ name: Uml.Attributes.body, value: { literal: body } })
}
