export interface Show {
  show(indent?: number): string
}

export class GraphModel implements Show {
  readonly #nodes: GraphNode[] = []
  readonly #nodeMap: Map<string, GraphNode> = new Map()
  readonly #edges: GraphEdge[] = []

  public constructor(
    public readonly root: GraphNode,
    public readonly idAttribute: string
  ) {}

  public get nodes(): Readonly<GraphNode[]> {
    return this.#nodes
  }

  public get edges(): Readonly<GraphEdge[]> {
    return this.#edges
  }

  public getNodeById(id: string): GraphNode | undefined {
    return this.#nodeMap.get(id)
  }

  public getNodeId(node: GraphNode): string | undefined {
    return node.getAttribute(this.idAttribute)?.value.literal
  }

  public getNearestIdentifiableNode(node: GraphNode): GraphNode | null {
    if (this.getNodeId(node) !== undefined) {
      return node
    }
    const parent = node.parent
    if (parent === null) {
      return null
    }
    if (this.getNodeId(parent) !== undefined) {
      return parent
    }
    return this.getNearestIdentifiableNode(parent)
  }

  public addNode(node: GraphNode) {
    this.#nodes.push(node)
    const id = this.getNodeId(node)
    if (id !== undefined) {
      this.#nodeMap.set(id, node)
    }
  }

  public addEdge(edge: GraphEdge) {
    this.#edges.push(edge)
  }

  public show(): string {
    return this.root.show(0)
  }
}

export class GraphNode implements Show {
  #parent: GraphNode | null = null

  public readonly outgoingEdges = new Set<GraphEdge>()
  public readonly incomingEdges = new Set<GraphEdge>()

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
    const attributes = Object.keys(this.attributes)
      .map((attribute) => this.showAttribute(attribute))
      .join('')

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
  readonly fullName: AttributeName
  readonly name: AttributeName
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

export class GraphEdge {
  public constructor(
    public readonly tag: string,
    public readonly source: GraphNode,
    public readonly target: GraphNode
  ) {
    source.outgoingEdges.add(this)
    target.incomingEdges.add(this)
  }
}

function createIndent(indent: number): string {
  return ' '.repeat(indent)
}
