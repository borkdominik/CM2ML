import type { GraphNode, Metamodel } from '@cm2ml/ir'

import type { HandlerPropagation, MetamodelElement } from './metamodel'

export function createHandlerRegistry<
  AttributeName extends string,
  Type extends string,
  AbstractType extends string,
  Tag extends string,
  HandlerParameters extends HandlerPropagation,
>(
  metamodel: Metamodel<AttributeName, Type, Tag>,
  handlers: Record<
    `${string}Handler`,
    MetamodelElement<AttributeName, Type, AbstractType, Tag, HandlerParameters>
  >,
) {
  const handlerRegistry = new Map<
    Type | Tag,
    MetamodelElement<AttributeName, Type, AbstractType, Tag, HandlerParameters>
  >()

  function getHandler(key: string | undefined) {
    if (metamodel.isValidType(key)) {
      return handlerRegistry.get(key)
    }
    return undefined
  }

  function inferHandler(node: GraphNode) {
    return getHandler(node.type) ?? getHandler(node.tag)
  }

  function registerHandler(
    key: Type | Tag,
    handler: MetamodelElement<AttributeName, Type, AbstractType, Tag, HandlerParameters>,
  ) {
    if (handlerRegistry.has(key)) {
      throw new Error(`Handler for ${key} already registered`)
    }
    handlerRegistry.set(key, handler)
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

  return { inferHandler }
}
