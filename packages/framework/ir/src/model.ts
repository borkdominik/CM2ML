import { GraphEdge } from './graph-edge'
import { GraphNode } from './graph-node'
import type { Show } from './ir-utils'
import { requireSameModel } from './ir-utils'
import type { Metamodel } from './metamodel'

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
   * @param retainChildren - If enabled, child nodes will not be removed, unless the node has no parent itself.
   */
  public removeNode(node: GraphNode, retainChildren: boolean = false) {
    const parent = node.parent
    const protectedNodes = retainChildren && parent !== undefined ? new Set(node.children.values()) : new Set<GraphNode>()
    this.purgeNode(node, protectedNodes)
    protectedNodes.forEach((child) => parent?.addChild(child))
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
    node.children.forEach((child) => {
      this.purgeNode(child, protectedNodes)
      if (protectedNodes.has(child)) {
        node.removeChild(child)
      }
    })
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
