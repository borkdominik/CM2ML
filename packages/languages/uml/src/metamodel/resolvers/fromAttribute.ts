import type { GraphNode } from '@cm2ml/ir'
import { getMessage } from '@cm2ml/utils'

import { type UmlMetamodelElement, requireAssignability } from '../uml-metamodel'

import { resolvePath } from './path'

export interface ResolverConfiguration {
  many?: boolean
  removeAttribute?: boolean
  required?: boolean
  type?: UmlMetamodelElement
}

function resolveNode(node: GraphNode, attribute: string, type: UmlMetamodelElement | undefined) {
  const resolvedNode = node.model.getNodeById(attribute) ?? resolvePath(node.model, attribute)
  if (!resolvedNode) {
    throw new Error(`Could not resolve ${name} from attribute of ${node.tag} node.`)
  }
  if (resolvedNode && type) {
    requireAssignability(resolvedNode, type)
  }
  return resolvedNode
}

export function resolveFromAttribute(node: GraphNode, name: string, configuration: ResolverConfiguration & { required: true }): GraphNode
export function resolveFromAttribute(node: GraphNode, name: string, configuration: ResolverConfiguration & { many: true, required?: false }): GraphNode[]
export function resolveFromAttribute(node: GraphNode, name: string, configuration?: ResolverConfiguration): GraphNode | undefined
export function resolveFromAttribute(node: GraphNode, name: string, { type, many = false, removeAttribute = true, required = false }: ResolverConfiguration = {}) {
  const attribute = node.getAttribute(name)?.value.literal
  if (required && !attribute) {
    throw new Error(`Missing required attribute ${name} on ${node.tag} node.`)
  } else if (!attribute) {
    return many ? [] : undefined
  }
  if (removeAttribute) {
    node.removeAttribute(name)
  }
  try {
    if (!many) {
      return resolveNode(node, attribute, type)
    }
    return attribute.split(' ').map((id) => resolveNode(node, id, type))
  } catch (error) {
    throw new Error(`Error while resolving ${name} from attribute of ${node.tag} node: ${getMessage(error)}`)
  }
}
