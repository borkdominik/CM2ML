import type { GraphNode } from '@cm2ml/ir'
import { getMessage } from '@cm2ml/utils'

import type { UmlMetamodelElement } from '../uml-metamodel'

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
  if (resolvedNode) {
    type?.narrowType(resolvedNode)
  }
  return resolvedNode
}

export function resolve(node: GraphNode, name: string, configuration: ResolverConfiguration & { many: true }): GraphNode[]
export function resolve(node: GraphNode, name: string, configuration?: ResolverConfiguration): GraphNode | undefined
export function resolve(node: GraphNode, name: string, configuration?: ResolverConfiguration): GraphNode | GraphNode[] | undefined {
  if (configuration?.many === true) {
    const resolvedFromAttribute = resolveFromAttribute(node, name, { ...configuration, many: true })
    const resolvedFromChild = resolveFromChild(node, name, { ...configuration, many: true })
    return resolvedFromAttribute.concat(resolvedFromChild)
  }
  return resolveFromAttribute(node, name, configuration) ?? resolveFromChild(node, name, configuration)
}

export function resolveFromChild(node: GraphNode, tag: string, configuration: ResolverConfiguration & { many: true }): GraphNode[]
export function resolveFromChild(node: GraphNode, tag: string, configuration?: ResolverConfiguration): GraphNode | undefined
export function resolveFromChild(node: GraphNode, tag: string, { type, many = false }: ResolverConfiguration = {}) {
  if (!many) {
    const child = node.findChild(matchTag(tag))
    if (!child) {
      return undefined
    }
    type?.narrowType(child)
    return tryFollowIdRef(child)
  }
  return node.findAllChildren(matchTag(tag)).map((child) => {
    type?.narrowType(child)
    return tryFollowIdRef(child)
  })
}

function tryFollowIdRef(node: GraphNode) {
  const idRef = node.getAttribute('xmi:idref')?.value.literal
  if (!idRef) {
    return node
  }
  const referencedElement = node.model.getNodeById(idRef)
  if (referencedElement) {
    node.model.removeNode(node)
  }
  return referencedElement ?? node
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
    return attribute.split(' ').map((id) => resolveNodeFromIdOrPath(node, id, type)).filter((node): node is GraphNode => !!node)
  } catch (error) {
    throw new Error(`Error while resolving ${name} from attribute of ${node.tag} node: ${getMessage(error)}`)
  }
}
