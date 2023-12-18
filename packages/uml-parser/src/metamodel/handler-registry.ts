import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import type { UmlTag, UmlType } from '../uml'

import { handlers } from './handlers'
import type { MetamodelElement } from './metamodel'

// This registry includes all handlers that are addressable by a UML tag or type
const handlerRegistry = new Map<UmlTag | UmlType, MetamodelElement>()

function registerHandler(key: UmlTag | UmlType, handler: MetamodelElement) {
  if (handlerRegistry.has(key)) {
    throw new Error(`Handler for ${key} already registered`)
  }
  handlerRegistry.set(key, handler)
}

function getHandler(key: string | undefined) {
  if (Uml.isValidTag(key) || Uml.isValidType(key)) {
    return handlerRegistry.get(key)
  }
  return undefined
}

Object.values(handlers).forEach((handler) => {
  const tag = handler.tag
  if (tag !== undefined) {
    registerHandler(tag, handler)
  }
  const type = handler.type
  if (type !== undefined) {
    registerHandler(type, handler)
  }
})

export function inferHandler(node: GraphNode) {
  return getHandler(Uml.getType(node)) ?? getHandler(node.tag)
}
