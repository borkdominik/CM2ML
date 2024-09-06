import type { ModelMember } from '@cm2ml/ir'

const separator = '@'

export const attributeKeyword = `attribute${separator}`

class AttributeValueSelector {
  public constructor(public readonly attribute: string) { }

  public select(element: ModelMember) {
    return element.getAttribute(this.attribute)?.value.literal
  }

  public static fromString(selector: string) {
    if (!selector.startsWith(attributeKeyword)) {
      throw new Error(`Invalid selector: ${selector}`)
    }
    const attribute = selector.slice(attributeKeyword.length)
    if (attribute.includes(separator)) {
      throw new Error(`Invalid attribute: ${attribute}`)
    }
    return new AttributeValueSelector(attribute)
  }
}

const directAccessKeys = ['id', 'type', 'tag', 'name'] as const
type DirectAccessKey = typeof directAccessKeys[number]
function isDirectAccessKey(key: string): key is DirectAccessKey {
  return directAccessKeys.includes(key as DirectAccessKey)
}

class DirectSelector {
  public constructor(public readonly key: DirectAccessKey) { }

  public select(element: ModelMember) {
    return element[this.key]
  }

  public static fromString(selector: string) {
    if (!isDirectAccessKey(selector)) {
      return null
    }
    return new DirectSelector(selector)
  }
}

export function getSelector(selector: string) {
  return DirectSelector.fromString(selector) ?? AttributeValueSelector.fromString(selector)
}

export type Selector = ReturnType<typeof getSelector>

class EqualityFilter {
  public constructor(public readonly selector: Selector, public readonly comparator: '=', public readonly target: string | Selector) { }

  public matches(element: ModelMember) {
    const selected = this.selector.select(element)
    const resolvedTarget = typeof this.target === 'string' ? this.target : this.target.select(element)
    return selected === resolvedTarget
  }

  public static fromString(filter: string) {
    const parts = filter.split('=')
    if (parts.length !== 2) {
      throw new Error(`Invalid filter: ${filter}`)
    }
    const selector = getSelector(parts[0]!)
    if (selector === null) {
      throw new Error(`Invalid filter: ${filter}`)
    }
    const target = parts[1]!
    if (target.at(0) === '"' && target.at(-1) === '"') {
      return new EqualityFilter(selector, '=', target.slice(1, -1))
    }
    const targetSelector = getSelector(target)
    if (!targetSelector) {
      throw new Error(`Invalid filter: ${filter}`)
    }
    return new EqualityFilter(selector, '=', targetSelector)
  }
}

export function getFilter(filter: string) {
  return EqualityFilter.fromString(filter)
}
