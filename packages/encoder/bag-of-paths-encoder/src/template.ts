import type { ModelMember } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { getFilter, getSelector } from './mapper'

export interface Template {
  isApplicable: (modelMember: ModelMember) => boolean
  apply: (modelMember: ModelMember) => string
}

export function compileTemplate(rawInput: string): Template {
  const { rawFilter, rawTemplate } = extractFilter(rawInput)
  if (!rawTemplate) {
    throw new Error(`Invalid template: ${rawInput}`)
  }
  if (!rawTemplate.startsWith('{') || !rawTemplate.endsWith('}')) {
    throw new Error(`Invalid template: ${rawInput}`)
  }
  const segments = getSegments(rawTemplate)
  if (!segments) {
    throw new Error(`Invalid template: ${rawInput}`)
  }
  const replacers = segments.map(parseSegment)
  const f = rawFilter ? getFilter(rawFilter) : undefined
  return {
    isApplicable: (modelMember: ModelMember) => !f || f.matches(modelMember),
    apply: (modelMember: ModelMember) => Stream.from(replacers).map((replace) => replace(modelMember)).filterNonNull().join(''),
  }
}

function extractFilter(template: string) {
  const parts = template.split('->')
  if (parts.length === 0) {
    return {}
  }
  if (parts.length === 1) {
    return { rawTemplate: parts[0]! }
  }
  if (parts.length === 2) {
    return { rawFilter: parts[0]!, rawTemplate: parts[1]! }
  }
  throw new Error(`Invalid template: ${template}`)
}

export function getSegments(template: string) {
  const parts = template.split('}{')
  if (parts.length === 0) {
    return null
  }
  parts[0] = parts[0]!.slice(1)
  parts[parts.length - 1] = parts[parts.length - 1]!.slice(0, -1)
  return parts
}

export function parseSegment(segment: string) {
  if (segment.startsWith('{') && segment.endsWith('}')) {
    const mapper = getSelector(segment.slice(1, -1))
    return (modelMember: ModelMember): string | undefined => {
      const mapped = mapper.select(modelMember)
      if (Array.isArray(mapped)) {
        return mapped.join('')
      }
      return mapped
    }
  }
  return () => segment
}
