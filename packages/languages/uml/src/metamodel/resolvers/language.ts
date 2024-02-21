import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { Uml } from '../uml'

function resolveLanguages(node: GraphNode) {
  const languageChildren = node.findAllChildren((child) => child.tag === 'language')
  return Stream.from(languageChildren).forEach((language) => {
    node.model.removeNode(language)
  }).map((language) => language.getAttribute(Uml.Attributes.language))
}

export function setLanguageAttribute(node: GraphNode) {
  // TODO/Jan: How to handle multiple languages?
  const language = resolveLanguages(node).join(' ').trim()
  if (!language) {
    return
  }
  node.addAttribute({ name: Uml.Attributes.language, value: { literal: language } })
}
