import type { Attributable, GraphEdge, GraphNode } from '@cm2ml/ir'
import { parseNamespace } from '@cm2ml/utils'

const Attributes = {
  id: 'id',
  name: 'name',
  source: 'source',
  target: 'target',
  type: 'type',
  'xsi:type': 'xsi:type',
  documentation: 'documentation',
} as const

const Tags = {
  'archimate:model': 'archimate:model',
  folder: 'folder',
  element: 'element',
  purpose: 'purpose',
  documentation: 'documentation',
} as const

export type ArchimateTag = (typeof Tags)[keyof typeof Tags]

function isValidTag(tag: string | undefined): tag is ArchimateTag {
  return tag !== undefined && tag in Tags
}

const AbstractTypes = {} as const

export type ArchimateAbstractType = (typeof AbstractTypes)[keyof typeof AbstractTypes]

const Types = {
  Model: 'model',
  Folder: 'folder',
  Element: 'element',
  Purpose: 'purpose',
  Documentation: 'documentation',
} as const

export type ArchimateType = (typeof Types)[keyof typeof Types]

function isValidType(type: string | undefined): type is ArchimateType {
  return type !== undefined && type in Types
}

function getTagType(element: GraphNode | GraphEdge) {
  const parsedName = parseNamespace(element.tag)
  const actualName = typeof parsedName === 'object' ? parsedName.name : parsedName
  if (isValidType(actualName)) {
    return actualName
  }
  return undefined
}

function getType(element: Attributable) {
  const typeAttr = element.getAttribute(Attributes['xsi:type']) ?? element.getAttribute(Attributes.type)
  const type = typeAttr?.value.literal
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
  typeAttributeName: Attributes['xsi:type'],
  getTagType,
  getType,
  isValidTag,
  isValidType,
} as const
