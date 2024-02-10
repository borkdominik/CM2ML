import type { GraphNode } from '@cm2ml/ir'

import { type UmlMetamodelElement, requireAssignability } from '../uml-metamodel'

import { resolvePath } from './path'

export interface ResolverConfiguration {

  removeAttribute?: boolean
  required?: boolean
  type?: UmlMetamodelElement
}

export function resolveFromAttribute(node: GraphNode, name: string, configuration: ResolverConfiguration & { required: true }): GraphNode
export function resolveFromAttribute(node: GraphNode, name: string, configuration?: ResolverConfiguration): GraphNode | undefined
export function resolveFromAttribute(node: GraphNode, name: string, { type, removeAttribute = true, required = false }: ResolverConfiguration = {}) {
  const attribute = node.getAttribute(name)?.value.literal
  if (!attribute) {
    return undefined
  }
  if (removeAttribute) {
    node.removeAttribute(name)
  }
  const resolvedNode = node.model.getNodeById(attribute) ?? resolvePath(node.model, attribute)
  if (!resolvedNode && required) {
    throw new Error(`Could not resolve ${name} from attribute of ${node.tag} node.`)
  }
  if (resolvedNode && type) {
    requireAssignability(resolvedNode, type)
  }
  return resolvedNode
}
