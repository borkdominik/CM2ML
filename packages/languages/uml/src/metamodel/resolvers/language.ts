import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { Uml } from '../uml'

function resolveLanguages(node: GraphNode) {
  const languageChildren = node.findAllChildren((child) => child.tag === 'language')
  return Stream.from(languageChildren).forEach((language) => {
    node.model.removeNode(language)
  }).map((language) => language.getAttribute(Uml.Attributes.language)?.value.literal).filterNonNull()
}

/**
 * Sets the `language` attribute of a node to the combined bodies of all its `language` children.
 */
export function setLanguageAttribute(node: GraphNode) {
  const language = resolveLanguages(node).join(' ').trim()
  if (!language) {
    return
  }
  node.addAttribute({ name: Uml.Attributes.language, type: 'string', value: { literal: language } })
}
