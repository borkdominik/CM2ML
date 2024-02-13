import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'

function resolveBodyAttribute(node: GraphNode) {
  const body = node.findChild((child) => child.tag === 'body')
  if (!body) {
    return
  }
  node.model.removeNode(body)
  return body.getAttribute(Uml.Attributes.body)
}

export function setBodyAttribute(node: GraphNode) {
  const body = resolveBodyAttribute(node)
  if (!body) {
    return
  }
  node.addAttribute({ name: Uml.Attributes.body, value: body.value })
}
