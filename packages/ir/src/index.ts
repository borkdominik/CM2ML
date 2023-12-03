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

  public getNearestIdentifiableNode(node: GraphNode): GraphNode | undefined {
    if (this.getNodeId(node) !== undefined) {
      return node
    }
    const parent = node.parent
    if (parent === undefined) {
      return undefined
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
  #parent: GraphNode | undefined = undefined

  readonly #children = new Set<GraphNode>()

  readonly #attributes = new Map<AttributeName, Attribute>()

  readonly #outgoingEdges = new Set<GraphEdge>()
  readonly #incomingEdges = new Set<GraphEdge>()

  public constructor(public readonly tag: string) {}

  public get parent(): GraphNode | undefined {
    return this.#parent
  }

  /**
   * Do not set the parent outside the parser.
   */
  public set parent(parent: GraphNode | undefined) {
    this.#parent = parent
  }

  public get children(): ReadonlySet<GraphNode> {
    return this.#children
  }

  public get attributes(): ReadonlyMap<AttributeName, Attribute> {
    return this.#attributes
  }

  public get outgoingEdges(): ReadonlySet<GraphEdge> {
    return this.#outgoingEdges
  }

  public get incomingEdges(): ReadonlySet<GraphEdge> {
    return this.#incomingEdges
  }

  /**
   * Also sets this node as the parent of the child.
   */
  public addChild(child: GraphNode) {
    this.#children.add(child)
    child.parent = this
  }

  public findChild(
    predicate: (child: GraphNode) => boolean
  ): GraphNode | undefined {
    for (const child of this.children) {
      if (predicate(child)) {
        return child
      }
    }
    return undefined
  }

  /**
   * Also sets the parent of the child to null.
   */
  public removeChild(child: GraphNode) {
    this.#children.delete(child)
    child.parent = undefined
  }

  public getAttribute(name: AttributeName): Attribute | undefined {
    return this.#attributes.get(name)
  }

  public addAttribute(attribute: Attribute, preventOverwrite = false) {
    if (preventOverwrite && this.#attributes.has(attribute.name)) {
      throw new Error(`Attribute ${attribute.name} already exists`)
    }
    this.#attributes.set(attribute.name, attribute)
  }

  public removeAttribute(name: AttributeName) {
    this.#attributes.delete(name)
  }

  public addIncomingEdge(edge: GraphEdge) {
    this.#incomingEdges.add(edge)
  }

  public removeIncomingEdge(edge: GraphEdge) {
    this.#incomingEdges.delete(edge)
  }

  public addOutgoingEdge(edge: GraphEdge) {
    this.#outgoingEdges.add(edge)
  }

  public removeOutgoingEdge(edge: GraphEdge) {
    this.#outgoingEdges.delete(edge)
  }

  public show(indent: number): string {
    const attributes = [...this.#attributes.values()]
      .map((attribute) => this.showAttribute(attribute))
      .join('')

    if (this.children.size === 0) {
      return `${createIndent(indent)}<${this.tag}${attributes} />`
    }

    const children = [...this.children.values()]
      .map((child) => child.show(indent + 2))
      .join('\n')

    return `${createIndent(indent)}<${
      this.tag
    }${attributes}>\n${children}\n${createIndent(indent)}</${this.tag}>`
  }

  private showAttribute(attribute: Attribute) {
    return ` ${attribute.name}="${attribute.value.literal}"`
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
    source.addOutgoingEdge(this)
    target.addIncomingEdge(this)
  }
}

function createIndent(indent: number): string {
  return ' '.repeat(indent)
}
