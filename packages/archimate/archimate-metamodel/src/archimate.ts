import type { Attributable, GraphNode } from '@cm2ml/ir'
import { parseNamespace } from '@cm2ml/utils'

const Attributes = {
  id: 'id',
  name: 'name',
  source: 'source',
  target: 'target',
  type: 'type', // used by <folder> (other tags use xsi:type)
  'xsi:type': 'xsi:type',
} as const

const Tags = {
  folder: 'folder',
  element: 'element',
} as const

export type ArchimateTag = (typeof Tags)[keyof typeof Tags]

function isValidTag(tag: string | undefined): tag is ArchimateTag {
  return tag !== undefined && tag in Tags
}

const AbstractTypes = {} as const

export type ArchimateAbstractType =
  (typeof AbstractTypes)[keyof typeof AbstractTypes]

const Types = {
  BusinessRole: 'BusinessRole',
  Model: 'Model',
} as const

export type ArchimateType = (typeof Types)[keyof typeof Types]

function isValidType(type: string | undefined): type is ArchimateType {
  return type !== undefined && type in Types
}

function getTagType(node: GraphNode) {
  const parsedName = parseNamespace(node.tag)
  const actualName =
    typeof parsedName === 'object' ? parsedName.name : parsedName
  if (isValidType(actualName)) {
    return actualName
  }
  return undefined
}

function getType(node: Attributable) {
  const type = node.getAttribute(Attributes['xsi:type'])?.value.literal
  if (isValidType(type)) {
    return type
  }
  return undefined
}

export const Archimate = {
  Attributes,
  AbstractTypes,
  Tags,
  Types,
  typeAttributeName: Attributes['xsi:type'] || Attributes.type,
  getTagType,
  getType,
  isValidTag,
  isValidType,
} as const
