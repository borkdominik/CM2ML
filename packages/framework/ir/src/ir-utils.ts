import type { Attribute } from './attributes'
import { GraphModel } from './model'
import type { ModelMember } from './model-member'

export interface Show {
  show: (indent?: number) => string
}

export function requireSameModel(
  first: ModelMember | GraphModel,
  second: ModelMember | GraphModel,
) {
  const firstModel: GraphModel | undefined = first instanceof GraphModel ? first : first.model
  const secondModel: GraphModel | undefined = second instanceof GraphModel ? second : second.model
  if (firstModel !== secondModel || firstModel === undefined || secondModel === undefined) {
    throw new Error('Both entities must be members of the same model')
  }
}

export function showAttribute(attribute: Attribute) {
  const value = attribute.value.literal.includes('\n')
    ? '{{omitted}}'
    : attribute.value.literal
  return ` ${attribute.name}="${value}"`
}

export function createIndent(indent: number): string {
  return ' '.repeat(indent)
}
