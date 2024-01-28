import type { Attributable, GraphNode } from '@cm2ml/ir'
import { parseNamespace } from '@cm2ml/utils'

const Attributes = {
  'xsi:id': 'xsi:id',
  // TODO: Is this the correct type?
  'xsi:type': 'xsi:type',
} as const

const Tags = {} as const

export type EcoreTag = (typeof Tags)[keyof typeof Tags]

function isValidTag(tag: string | undefined): tag is EcoreTag {
  return tag !== undefined && tag in Tags
}

export const AbstractTypes = {} as const

export type EcoreAbstractType =
  (typeof AbstractTypes)[keyof typeof AbstractTypes]

const Types = {} as const

export type EcoreType = (typeof Types)[keyof typeof Types]

function isValidType(type: string | undefined): type is EcoreType {
  return type !== undefined && type in Types
}

function getType(node: Attributable) {
  const type = node.getAttribute(Attributes['xsi:type'])?.value.literal
  if (isValidType(type)) {
    return type
  }
  return undefined
}

// The root element may use its type as its tag
function getTagType(node: GraphNode) {
  const parsedName = parseNamespace(node.tag)
  const actualName =
    typeof parsedName === 'object' ? parsedName.name : parsedName
  if (isValidType(actualName)) {
    return actualName
  }
  return undefined
}

export const Ecore = {
  Attributes,
  AbstractTypes,
  Tags,
  Types,
  typeAttributeName: Attributes['xsi:type'],
  getTagType,
  getType,
  isValidTag,
  isValidType,
}
