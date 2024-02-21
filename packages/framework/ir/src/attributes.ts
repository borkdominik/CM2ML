// Include strings here for autocomplete.
export type AttributeName =
  | 'id'
  | 'idref'
  | 'name'
  | 'type'
  | (string & Record<never, never>)

export interface SimpleAttribute {
  readonly name: AttributeName
  readonly value: Value
}

export interface NamespacedAttribute {
  readonly name: AttributeName
  readonly simpleName: string
  readonly namespace: string
  readonly value: Value
}

export type Attribute = SimpleAttribute | NamespacedAttribute

export interface SimpleValue {
  readonly literal: string
}

export interface NamespacedValue extends SimpleValue {
  readonly namespace: string
}

export type Value = SimpleValue | NamespacedValue

export interface Attributable {
  readonly attributes: ReadonlyMap<AttributeName, Attribute>
  getAttribute: (name: AttributeName) => Attribute | undefined
  addAttribute: (attribute: Attribute, preventOverwrite?: boolean) => void
  removeAttribute: (name: AttributeName) => Attribute | undefined
}

export class AttributeDelegate implements Attributable {
  readonly #attributes = new Map<AttributeName, Attribute>()
  public readonly attributes: ReadonlyMap<AttributeName, Attribute> =
    this.#attributes

  public constructor(
    private readonly attributeChangeListener:
      | ((
        attributeName: AttributeName,
        previousValue: Value | undefined,
        newValue: Value | undefined,
      ) => void)
      | undefined,
  ) {}

  public getAttribute(name: AttributeName): Attribute | undefined {
    return this.#attributes.get(name)
  }

  // TODO/Jan: Default preventOverwrite to true
  public addAttribute(attribute: Attribute, preventOverwrite = true) {
    const key = attribute.name
    const previousValue = this.#attributes.get(key)
    if (preventOverwrite && previousValue !== undefined) {
      throw new Error(`Attribute ${key} already exists`)
    }
    this.#attributes.set(key, attribute)
    this.attributeChangeListener?.(key, previousValue?.value, attribute.value)
  }

  public removeAttribute(name: AttributeName) {
    const previousValue = this.#attributes.get(name)
    this.#attributes.delete(name)
    this.attributeChangeListener?.(name, previousValue?.value, undefined)
    return previousValue
  }
}
