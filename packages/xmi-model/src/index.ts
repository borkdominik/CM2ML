export interface Show {
  show(indent?: number): string
}

export class XmiModel implements Show {
  public constructor(
    public readonly root: XmiElement,
    public readonly elements: Readonly<XmiElement[]>,
    public readonly references: Readonly<XmiReference[]>
  ) {}

  public show(): string {
    return this.root.show(0)
  }
}

export class XmiElement implements Show {
  #parent: XmiElement | null = null

  public readonly referencedBy = new Set<XmiElement>()

  public constructor(
    public readonly tag: string,
    public readonly attributes: Record<XmiAttributeName, XmiAttribute>,
    public readonly children: Readonly<XmiElement[]>
  ) {}

  public get parent(): XmiElement | null {
    return this.#parent
  }

  /**
   * Do not set the parent outside the parser.
   */
  public set parent(parent: XmiElement | null) {
    this.#parent = parent
  }

  public getAttribute(name: XmiAttributeName): XmiAttribute | undefined {
    return this.attributes[name]
  }

  public show(indent: number): string {
    const name = this.showAttribute('name')
    const id = this.showAttribute('id')
    const idref = this.showAttribute('idref')

    const attributes = `${name}${id}${idref}`

    if (this.children.length === 0) {
      return `${createIndent(indent)}<${this.tag}${attributes} />`
    }

    const children = this.children
      .map((child) => child.show(indent + 2))
      .join('\n')

    return `${createIndent(indent)}<${
      this.tag
    }${attributes}>\n${children}\n${createIndent(indent)}</${this.tag}>`
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

export class XmiReference {
  public constructor(
    public readonly element: XmiElement,
    public readonly source: XmiElement,
    public readonly target: XmiElement
  ) {}
}

function createIndent(indent: number): string {
  return ' '.repeat(indent)
}
