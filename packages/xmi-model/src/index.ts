export interface Show {
  show(): string
}

export class XmiModel implements Show {
  public constructor(
    public readonly elements: Readonly<XmiElement[]>,
    public readonly relationships: Readonly<XmiRelationship[]>
  ) {}

  public show(): string {
    return `Elements:\n
    ${this.elements.map((element) => element.show()).join('\n')}
    Relationships:\n
    ${this.relationships.map((relationship) => relationship.show()).join('\n')}`
  }
}

export class XmiElement implements Show {
  public parent: XmiElement | null = null

  public constructor(
    public readonly tag: string,
    public readonly attributes: Record<XmiAttributeName, XmiAttribute>,
    public readonly children: Readonly<XmiElement[]>
  ) {}

  public getAttribute(name: XmiAttributeName): XmiAttribute | undefined {
    return this.attributes[name]
  }

  /** Do not call this outside the parser.
   * TODO: Move mapping to static internal method in order to make this private.
   */
  public setParent(parent: XmiElement) {
    this.parent = parent
  }

  public show(): string {
    const tag = `<${this.tag}`
    const name = this.showAttribute('name')
    const id = this.showAttribute('id')
    const idref = this.showAttribute('idref')

    return `${tag}${name}${id}${idref} />`
  }

  private showAttribute(name: XmiAttributeName) {
    const attribute = this.getAttribute(name)
    if (attribute === undefined) {
      return ''
    }
    return ` ${name}="${attribute.value.literal}"`
  }
}

export type XmiAttributeName =
  | 'id'
  | 'idref'
  | 'name'
  | 'type'
  | (string & Record<never, never>)

export interface XmiAttribute {
  readonly name: XmiAttributeName
  readonly namespace?: string
  readonly value: XmiValue
}

export interface XmiValue {
  readonly literal: string
  readonly namespace?: string
}

export class XmiRelationship implements Show {
  public constructor(
    public readonly type: string,
    public readonly source: XmiElement,
    public readonly target: XmiElement
  ) {}

  public show(): string {
    return `${this.source.show()} ${this.type} ${this.target.show()}`
  }
}
