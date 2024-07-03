import { parseNamespace } from '@cm2ml/utils'

import type { Attributable, Attribute, AttributeName } from './attributes'
import { AttributeDelegate } from './attributes'

export * from './attributes'

export interface Show {
  show: (indent?: number) => string
}

export interface ModelMember {
  readonly model: GraphModel
  readonly isRemoved: boolean
}

export interface MetamodelConfiguration<AttributeName extends string, Type extends string, Tag extends string> {
  attributes: AttributeName[] | readonly AttributeName[]
  idAttribute: AttributeName
  types: Type[] | readonly Type[]
  typeAttributes: [AttributeName, ...AttributeName[]]
  tags: Tag[] | readonly Tag[]
}

export type IdRecord<T extends string> = {
  [K in T]: K
}

export class Metamodel<const AttributeName extends string, const Type extends string, const Tag extends string> {
  public readonly Attributes: IdRecord<AttributeName>
  public readonly idAttribute: AttributeName
  public readonly typeAttributes: [AttributeName, ...AttributeName[]]
  public readonly Types: IdRecord<Type>
  public readonly Tags: IdRecord<Tag>

  public constructor({ attributes, idAttribute, types, typeAttributes, tags }: MetamodelConfiguration<AttributeName, Type, Tag>) {
    this.Attributes = Object.fromEntries(attributes.map((attribute) => [attribute, attribute])) as IdRecord<AttributeName>
    if (this.Attributes[idAttribute] === undefined) {
      throw new Error(`Id attribute ${idAttribute} must be in attributes`)
    }
    this.idAttribute = idAttribute
    this.Types = Object.fromEntries(types.map((type) => [type, type])) as IdRecord<Type>
    for (const typeAttribute of typeAttributes) {
      if (this.Attributes[typeAttribute] === undefined) {
        throw new Error(`Type attribute ${typeAttribute} must be in attributes`)
      }
    }
    this.typeAttributes = typeAttributes
    this.Tags = Object.fromEntries(tags.map((tag) => [tag, tag])) as IdRecord<Tag>
  }

  public getIdAttribute(node: GraphNode): Attribute | undefined {
    return node.getAttribute(this.idAttribute)
  }

  public isValidType(type: string | undefined): type is Type {
    return type !== undefined && type in this.Types
  }

  public isValidTag(tag: string | undefined): tag is Tag {
    return tag !== undefined && tag in this.Tags
  }

  public getType(element: GraphNode | GraphEdge): Type | undefined {
    return this.getTypeAttribute(element)?.value.literal as Type | undefined
  }

  public getTypeAttribute(element: GraphNode | GraphEdge): Attribute | undefined {
    for (const attribute of this.typeAttributes) {
      const type = element.getAttribute(attribute)
      if (this.isValidType(type?.value.literal)) {
        return type
      }
    }
    return undefined
  }

  public getTagType(element: GraphNode | GraphEdge): Type | undefined {
    const parsedName = parseNamespace(element.tag)
    const actualName =
      typeof parsedName === 'object' ? parsedName.name : parsedName
    if (this.isValidType(actualName)) {
      return actualName
    }
    return undefined
  }
}

export interface Settings {
  readonly debug: boolean
  readonly strict: boolean
}

export type DebugPrefix = 'Parser' | 'IR' | 'Encoder'

export class GraphModel implements Show {
  readonly #nodes = new Set<GraphNode>()
  readonly #nodeMap: Map<string, GraphNode> = new Map()
  readonly #edges = new Set<GraphEdge>()

  #root: GraphNode | undefined

  public readonly metadata: Record<string, string> = {}

  public constructor(
    public readonly metamodel: Metamodel<string, string, string>,
    public readonly settings: Settings,
  ) {
  }

  public get root(): GraphNode {
    if (!this.#root) {
      throw new Error('Root has not been initialized. This is an internal error of the parser.')
    }
    return this.#root
  }

  /**
   * Change the root note of the model.
   * Warning: All nodes that are not descendants of the new root will be removed.
   */
  public set root(newRoot: GraphNode) {
    requireSameModel(this, newRoot)
    if (this.#root) {
      // Purge old root node, if present
      this.purgeNode(this.#root, new Set([newRoot]))
    }
    newRoot.parent = undefined
    this.#root = newRoot
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
   * @deprecated Do not call this manually.
   * This method is automatically called by a GraphNode when its id attribute is changed.
   */
  public updateNodeMap(node: GraphNode, previousId: string | undefined) {
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

  /**
   * Create a root node for this model.
   * Can only be invoked once, if there is no root node yet.
   */
  public createRootNode(tag: string) {
    if (this.#root !== undefined) {
      throw new Error('Root node already exists')
    }
    const node = this.addNode(tag)
    this.root = node
    return node
  }

  /**
   * Remove a node from this model.
   * Warning: All children of the node will be removed as well.
   * Warning: All edges connected to the node will be removed as well.
   * Warning: It is no longer safe to access {@link GraphNode.model} after this operation.
   * @param node - The node to remove
   */
  public removeNode(node: GraphNode) {
    this.purgeNode(node, new Set())
  }

  private purgeNode(node: GraphNode, protectedNodes: Set<GraphNode>) {
    requireSameModel(this, node)
    if (protectedNodes.has(node)) {
      return
    }
    node.incomingEdges.forEach((edge) => this.removeEdge(edge))
    node.outgoingEdges.forEach((edge) => this.removeEdge(edge))
    const id = node.id
    if (id !== undefined) {
      this.#nodeMap.delete(id)
    }
    node.children.forEach((child) => this.purgeNode(child, protectedNodes))
    node.parent?.removeChild(node)
    this.#nodes.delete(node)
    // @ts-expect-error Evil illegal const assignment
    node.model = undefined
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

  /**
   * Remove an edge from this model.
   * Warning: It is no longer safe to access {@link GraphEdge.model} after this operation.
   * @param edge - The edge to remove
   */
  public removeEdge(edge: GraphEdge) {
    requireSameModel(this, edge)
    edge.source.removeOutgoingEdge(edge)
    edge.target.removeIncomingEdge(edge)
    this.#edges.delete(edge)
    // @ts-expect-error Evil illegal const assignment
    edge.model = undefined
  }

  public debug(prefix: DebugPrefix, message: string | (() => string)) {
    if (this.settings.debug) {
      // eslint-disable-next-line no-console
      console.log(`${prefix}: ${typeof message === 'string' ? message : message()}`)
    }
  }

  public show(): string {
    const nodes = this.root.show(0)
    const edges = [...this.edges.values()].map((edge) => edge.show()).sort().join('\n')
    return `${nodes}\n${edges}`.trim()
  }
}

export class GraphNode implements Attributable, ModelMember, Show {
  #parent: GraphNode | undefined = undefined

  readonly #children = new Set<GraphNode>()

  readonly #attributeDelegate = new AttributeDelegate(
    (attributeName, previousValue) => {
      if (attributeName === this.model.metamodel.idAttribute) {
        this.model.updateNodeMap(this, previousValue?.literal)
      }
    },
  )

  public readonly attributes = this.#attributeDelegate.attributes

  readonly #outgoingEdges = new Set<GraphEdge>()
  readonly #incomingEdges = new Set<GraphEdge>()

  public constructor(
    public readonly model: GraphModel,
    public tag: string,
  ) { }

  public get isRemoved(): boolean {
    return this.model === undefined
  }

  public get id(): string | undefined {
    return this.model.metamodel.getIdAttribute(this)?.value.literal
  }

  /**
   * Set the id of this node, but never overwrite an existing id.
   */
  public set id(id: string) {
    const idAttribute = this.model.metamodel.idAttribute
    this.addAttribute({ name: idAttribute, type: 'string', value: { literal: id } }, true)
  }

  public get idAttribute(): Attribute | undefined {
    return this.model.metamodel.getIdAttribute(this)
  }

  public get type(): string | undefined {
    return this.model.metamodel.getType(this)
  }

  /**
   * Set the type of this node.
   */
  public set type(type: string) {
    const typeAttribute = this.model.metamodel.typeAttributes[0]
    this.addAttribute({ name: typeAttribute, type: 'category', value: { literal: type } }, false)
  }

  public get typeAttribute(): Attribute | undefined {
    return this.model.metamodel.getTypeAttribute(this)
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

  public getAttribute(name: AttributeName): Attribute | undefined {
    return this.#attributeDelegate.getAttribute(name)
  }

  public addAttribute(
    attribute: Attribute,
    preventOverwrite?: boolean | undefined,
  ): void {
    this.#attributeDelegate.addAttribute(attribute, preventOverwrite)
  }

  public removeAttribute(name: AttributeName) {
    return this.#attributeDelegate.removeAttribute(name)
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

    return `${createIndent(indent)}<${
      this.tag
    }${attributes}>\n${children}\n${createIndent(indent)}</${this.tag}>`
  }
}

export class GraphEdge implements Attributable, ModelMember, Show {
  readonly #attributeDelegate = new AttributeDelegate(undefined)
  public readonly attributes = this.#attributeDelegate.attributes

  public constructor(
    public readonly model: GraphModel,
    public readonly tag: string,
    public readonly source: GraphNode,
    public readonly target: GraphNode,
  ) { }

  public get type(): string | undefined {
    return this.model.metamodel.getType(this)
  }

  /**
   * Set the type of this edge.
   */
  public set type(type: string) {
    const typeAttribute = this.model.metamodel.typeAttributes[0]
    this.addAttribute({ name: typeAttribute, type: 'category', value: { literal: type } }, false)
  }

  public get isRemoved(): boolean {
    return this.model === undefined
  }

  public getAttribute(name: AttributeName): Attribute | undefined {
    return this.#attributeDelegate.getAttribute(name)
  }

  public addAttribute(
    attribute: Attribute,
    preventOverwrite?: boolean | undefined,
  ): void {
    this.#attributeDelegate.addAttribute(attribute, preventOverwrite)
  }

  public removeAttribute(name: AttributeName) {
    return this.#attributeDelegate.removeAttribute(name)
  }

  public show(): string {
    const attributes = [...this.attributes.values()]
      .map((attribute) => showAttribute(attribute))
      .join('')

    return `${this.source.id} -> <${this.tag}${attributes} /> -> ${this.target.id}`
  }
}

function requireSameModel(
  first: ModelMember | GraphModel,
  second: ModelMember | GraphModel,
) {
  const firstModel: GraphModel | undefined = first instanceof GraphModel ? first : first.model
  const secondModel: GraphModel | undefined = second instanceof GraphModel ? second : second.model
  if (firstModel !== secondModel || firstModel === undefined || secondModel === undefined) {
    throw new Error('Both entities must be members of the same model')
  }
}

function showAttribute(attribute: Attribute) {
  const value = attribute.value.literal.includes('\n')
    ? '{{omitted}}'
    : attribute.value.literal
  return ` ${attribute.name}="${value}"`
}

function createIndent(indent: number): string {
  return ' '.repeat(indent)
}
