export interface Show {
  show(indent?: number): string
}

export interface ModelMember {
  readonly model: GraphModel
}

function requireSameModel(
  first: ModelMember | GraphModel,
  second: ModelMember | GraphModel
) {
  const firstModel = first instanceof GraphModel ? first : first.model
  const secondModel = second instanceof GraphModel ? second : second.model
  if (firstModel !== secondModel) {
    throw new Error('Both entities must be members of the same model')
  }
}

export class GraphModel implements Show {
  // TODO: Use sets instead of arrays
  readonly #nodes = new Set<GraphNode>()
  readonly #nodeMap: Map<string, GraphNode> = new Map()
  readonly #edges = new Set<GraphEdge>()

  public readonly root: GraphNode

  public constructor(public readonly idAttribute: string, rootTag: string) {
    this.root = this.addNode(rootTag)
  }

  public get nodes(): ReadonlySet<GraphNode> {
    return this.#nodes
  }

  public get edges(): ReadonlySet<GraphEdge> {
    return this.#edges
  }

  public getNodeById(id: string): GraphNode | undefined {
    return this.#nodeMap.get(id)
  }

  /**
   * Do not call this manually.
   * This should only be called by GraphNode when the id attribute is changed.
   */
  public updateNodeMap(
    node: GraphNode,
    previousId: string | undefined = undefined
  ) {
    requireSameModel(this, node)
    if (previousId !== undefined) {
      this.#nodeMap.delete(previousId)
    }
    const id = node.id
    if (id !== undefined) {
      if (this.#nodeMap.has(id)) {
        throw new Error(`Id ${id} already registered`)
      }
      this.#nodeMap.set(id, node)
    }
  }

  public addNode(tag: string) {
    const node = new GraphNode(this, tag)
    this.#nodes.add(node)
    return node
  }

  public removeNode(node: GraphNode) {
    requireSameModel(this, node)
    node.incomingEdges.forEach((edge) => this.removeEdge(edge))
    node.outgoingEdges.forEach((edge) => this.removeEdge(edge))
    const id = node.id
    if (id !== undefined) {
      this.#nodeMap.delete(id)
    }
    node.children.forEach((child) => this.removeNode(child))
    node.parent?.removeChild(node)
    this.#nodes.delete(node)
  }

  public addEdge(tag: string, source: GraphNode, target: GraphNode) {
    requireSameModel(this, source)
    requireSameModel(this, target)
    const edge = new GraphEdge(this, tag, source, target)
    source.addOutgoingEdge(edge)
    target.addIncomingEdge(edge)
    this.#edges.add(edge)
    return edge
  }

  public removeEdge(edge: GraphEdge) {
    requireSameModel(this, edge)
    edge.source.removeOutgoingEdge(edge)
    edge.target.removeIncomingEdge(edge)
    this.#edges.delete(edge)
  }

  public show(): string {
    return this.root.show(0)
  }
}

export class GraphNode implements ModelMember, Show {
  #parent: GraphNode | undefined = undefined

  readonly #children = new Set<GraphNode>()

  readonly #attributes = new Map<AttributeName, Attribute>()

  readonly #outgoingEdges = new Set<GraphEdge>()
  readonly #incomingEdges = new Set<GraphEdge>()

  public constructor(
    public readonly model: GraphModel,
    public readonly tag: string
  ) {}

  public get id(): string | undefined {
    return this.getAttribute(this.model.idAttribute)?.value.literal
  }

  public get parent(): GraphNode | undefined {
    return this.#parent
  }

  /**
   * Do not set the parent outside the parser.
   */
  public set parent(parent: GraphNode | undefined) {
    if (parent !== undefined) {
      requireSameModel(this, parent)
    }
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

  public getNearestIdentifiableNode(): GraphNode | undefined {
    if (this.id !== undefined) {
      return this
    }
    const parent = this.parent
    if (parent === undefined) {
      return undefined
    }
    if (parent.id !== undefined) {
      return parent
    }
    return parent.getNearestIdentifiableNode()
  }

  /**
   * Also sets this node as the parent of the child.
   */
  public addChild(child: GraphNode) {
    requireSameModel(this, child)
    if (child.parent !== undefined) {
      throw new Error('Child already has a parent')
    }
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
    requireSameModel(this, child)
    if (!this.#children.has(child)) {
      throw new Error('Child not found')
    }
    this.#children.delete(child)
    child.parent = undefined
  }

  public getAttribute(name: AttributeName): Attribute | undefined {
    return this.#attributes.get(name)
  }

  public addAttribute(attribute: Attribute, preventOverwrite = false) {
    const previousValue = this.#attributes.get(attribute.name)
    if (preventOverwrite && previousValue !== undefined) {
      throw new Error(`Attribute ${attribute.name} already exists`)
    }
    this.#attributes.set(attribute.name, attribute)
    if (attribute.name === this.model.idAttribute) {
      this.model.updateNodeMap(this, previousValue?.value.literal)
    }
  }

  public removeAttribute(name: AttributeName) {
    this.#attributes.delete(name)
  }

  public addIncomingEdge(edge: GraphEdge) {
    requireSameModel(this, edge)
    this.#incomingEdges.add(edge)
  }

  public removeIncomingEdge(edge: GraphEdge) {
    requireSameModel(this, edge)
    this.#incomingEdges.delete(edge)
  }

  public addOutgoingEdge(edge: GraphEdge) {
    requireSameModel(this, edge)
    this.#outgoingEdges.add(edge)
  }

  public removeOutgoingEdge(edge: GraphEdge) {
    requireSameModel(this, edge)
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

// TODO: Add attributes to graph edge via delegate
export class GraphEdge implements ModelMember {
  public constructor(
    public readonly model: GraphModel,
    public readonly tag: string,
    public readonly source: GraphNode,
    public readonly target: GraphNode
  ) {}
}

function createIndent(indent: number): string {
  return ' '.repeat(indent)
}
