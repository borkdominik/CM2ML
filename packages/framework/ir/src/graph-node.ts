import type { GraphEdge } from './graph-edge'
import { createIndent, requireSameModel, showAttribute } from './ir-utils'
import type { GraphModel } from './model'
import { ModelMember } from './model-member'

export class GraphNode extends ModelMember {
  #parent: GraphNode | undefined = undefined

  readonly #children = new Set<GraphNode>()

  readonly #outgoingEdges = new Set<GraphEdge>()
  readonly #incomingEdges = new Set<GraphEdge>()

  public constructor(
    public readonly model: GraphModel,
    public tag: string,
  ) {
    super((attributeName, previousValue) => {
      if (attributeName === this.model.metamodel.idAttribute) {
        this.model.updateNodeMap(this, previousValue?.literal)
      }
    })
  }

  public get parent(): GraphNode | undefined {
    return this.#parent
  }

  /**
   * @deprecated Do not call this manually. Use {@link GraphNode.addChild} or {@link GraphNode.removeChild} instead.
   * The parent is set automatically when adding or removing children.
   */
  public set parent(parent: GraphNode | undefined) {
    if (this.parent !== undefined && parent !== undefined) {
      throw new Error('Parent already set')
    }
    if (parent !== undefined) {
      requireSameModel(this, parent)
    }
    this.#parent = parent
  }

  public get children(): ReadonlySet<GraphNode> {
    return this.#children
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
    child.parent = this
    this.#children.add(child)
  }

  public findChild(
    predicate: (child: GraphNode) => boolean,
  ): GraphNode | undefined {
    for (const child of this.children) {
      if (predicate(child)) {
        return child
      }
    }
    return undefined
  }

  public findAllChildren(
    predicate: (child: GraphNode) => boolean,
  ): GraphNode[] {
    const result: GraphNode[] = []
    for (const child of this.children) {
      if (predicate(child)) {
        result.push(child)
      }
    }
    return result
  }

  /**
   * Also sets the parent of the child to null.
   */
  public removeChild(child: GraphNode) {
    requireSameModel(this, child)
    if (!this.#children.has(child)) {
      throw new Error('Child not found')
    }
    child.parent = undefined
    this.#children.delete(child)
  }

  /**
   * @deprecated Do not call this manually. Use {@link GraphModel.addEdge} instead.
   */
  public addIncomingEdge(edge: GraphEdge) {
    requireSameModel(this, edge)
    this.#incomingEdges.add(edge)
  }

  /**
   * @deprecated Do not call this manually. Use {@link GraphModel.removeEdge} instead.
   */
  public removeIncomingEdge(edge: GraphEdge) {
    requireSameModel(this, edge)
    this.#incomingEdges.delete(edge)
  }

  /**
   * @deprecated Do not call this manually. Use {@link GraphModel.addEdge} instead.
   */
  public addOutgoingEdge(edge: GraphEdge) {
    requireSameModel(this, edge)
    this.#outgoingEdges.add(edge)
  }

  /**
   * @deprecated Do not call this manually. Use {@link GraphModel.removeEdge} instead.
   */
  public removeOutgoingEdge(edge: GraphEdge) {
    requireSameModel(this, edge)
    this.#outgoingEdges.delete(edge)
  }

  public show(indent: number = 0): string {
    const attributes = [...this.attributes.values()]
      .map((attribute) => showAttribute(attribute))
      .sort()
      .join('')

    if (this.children.size === 0) {
      return `${createIndent(indent)}<${this.tag}${attributes} />`
    }

    const children = [...this.children.values()]
      .map((child) => child.show(indent + 2))
      .join('\n')

    return `${createIndent(indent)}<${this.tag
    }${attributes}>\n${children}\n${createIndent(indent)}</${this.tag}>`
  }
}
