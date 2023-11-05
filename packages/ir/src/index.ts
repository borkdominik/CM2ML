export interface Show {
  show(indent?: number): string
}

export class GraphModel implements Show {
  public constructor(
    public readonly root: GraphNode,
    public readonly elements: Readonly<GraphNode[]>,
    public readonly references: Readonly<GraphEdge[]>
  ) {}

  public show(): string {
    return this.root.show(0)
  }
}

export class GraphNode implements Show {
  #parent: GraphNode | null = null

  public readonly referencedBy = new Set<GraphNode>()

  public constructor(
    public readonly tag: string,
    public readonly attributes: Record<AttributeName, Attribute>,
    public readonly children: Readonly<GraphNode[]>
  ) {}

  public get parent(): GraphNode | null {
    return this.#parent
  }

  /**
   * Do not set the parent outside the parser.
   */
  public set parent(parent: GraphNode | null) {
    this.#parent = parent
  }

  public getAttribute(name: AttributeName): Attribute | undefined {
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

  private showAttribute(name: AttributeName) {
    const attribute = this.getAttribute(name)
    if (attribute === undefined) {
      return ''
    }
    return ` ${name}="${attribute.value.literal}"`
  }
}

export type AttributeName =
  | 'id'
  | 'idref'
  | 'name'
  | 'type'
  | (string & Record<never, never>)

export interface Attribute {
  readonly name: AttributeName
  readonly namespace?: string
  readonly value: Value
}

export interface Value {
  readonly literal: string
  readonly namespace?: string
}

export class GraphEdge {
  public constructor(
    public readonly element: GraphNode,
    public readonly source: GraphNode,
    public readonly target: GraphNode
  ) {}
}

function createIndent(indent: number): string {
  return ' '.repeat(indent)
}
