import type { GraphNode } from '@cm2ml/ir'
import { getMessage } from '@cm2ml/utils'

import { Uml } from '../uml'
import { type UmlMetamodelElement, requireAssignability } from '../uml-metamodel'

import { matchTag, resolvePath } from './path'

export interface ResolverConfiguration {
  many?: boolean
  removeAttribute?: boolean
  type?: UmlMetamodelElement
}

function resolveNodeFromIdOrPath(node: GraphNode, pathOrId: string, type: UmlMetamodelElement | undefined) {
  const resolvedNode = node.model.getNodeById(pathOrId) ?? resolvePath(node.model, pathOrId)
  if (!resolvedNode) {
    return undefined
    // throw new Error(`Could not resolve ${pathOrId} from ${node.tag} node.`)
  }
  if (resolvedNode && type) {
    requireAssignability(resolvedNode, type)
  }
  return resolvedNode
}

export function resolve(node: GraphNode, name: string, configuration: ResolverConfiguration & { many: true }): GraphNode[]
export function resolve(node: GraphNode, name: string, configuration?: ResolverConfiguration): GraphNode | undefined
export function resolve(node: GraphNode, name: string, configuration?: ResolverConfiguration): GraphNode | GraphNode[] | undefined {
  return resolveFromAttribute(node, name, configuration) ?? resolveFromChild(node, name, configuration)
}

export function resolveFromChild(node: GraphNode, tag: string, configuration: ResolverConfiguration & { many: true }): GraphNode[]
export function resolveFromChild(node: GraphNode, tag: string, configuration?: ResolverConfiguration): GraphNode | undefined
export function resolveFromChild(node: GraphNode, tag: string, { type, many = false }: ResolverConfiguration = {}) {
  function setFallbackType(child: GraphNode) {
    if (type?.type && !Uml.getType(child)) {
      child.addAttribute({ name: Uml.typeAttributeName, value: { literal: type.type } })
    }
  }
  if (!many) {
    const child = node.findChild(matchTag(tag))
    if (!child) {
      return
    }
    setFallbackType(child)
    return child
  }
  const children = node.findAllChildren(matchTag(tag))
  children.forEach(setFallbackType)
  return children
}

export function resolveFromAttribute(node: GraphNode, name: string, configuration: ResolverConfiguration & { many: true }): GraphNode[]
export function resolveFromAttribute(node: GraphNode, name: string, configuration?: ResolverConfiguration): GraphNode | undefined
export function resolveFromAttribute(node: GraphNode, name: string, { type, many = false, removeAttribute = true }: ResolverConfiguration = {}) {
  const attribute = node.getAttribute(name)?.value.literal
  if (!attribute) {
    return many ? [] : undefined
  }
  if (removeAttribute) {
    node.removeAttribute(name)
  }
  try {
    if (!many) {
      return resolveNodeFromIdOrPath(node, attribute, type)
    }
    return attribute.split(' ').map((id) => resolveNodeFromIdOrPath(node, id, type))
  } catch (error) {
    throw new Error(`Error while resolving ${name} from attribute of ${node.tag} node: ${getMessage(error)}`)
  }
}
