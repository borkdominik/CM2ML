import type { GraphNode } from '@cm2ml/ir'

import { resolvePath } from './path'

export function resolveFromAttribute(node: GraphNode, name: string, removeAttribute = true) {
  const attribute = node.getAttribute(name)?.value.literal
  if (!attribute) {
    return undefined
  }
  const resolvedNode = resolvePath(node.model, attribute)
  if (removeAttribute) {
    node.removeAttribute(name)
  }
  return resolvedNode
}

export function requireResolveFromAttribute(node: GraphNode, name: string, removeAttribute = true) {
  const resolvedNode = resolveFromAttribute(node, name, removeAttribute)
  if (!resolvedNode) {
    throw new Error(`Missing ${name} for node ${node.id}`)
  }
  return resolvedNode
}
