import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'

function resolveLanguageAttribute(node: GraphNode) {
  const language = node.findChild((child) => child.tag === 'language')
  if (!language) {
    return
  }
  node.model.removeNode(language)
  return language.getAttribute(Uml.Attributes.language)
}

export function setLanguageAttribute(node: GraphNode) {
  const language = resolveLanguageAttribute(node)
  if (!language) {
    return
  }
  node.addAttribute({ name: Uml.Attributes.language, value: language.value })
}
