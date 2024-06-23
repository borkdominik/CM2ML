import type { FeatureContext } from '@cm2ml/feature-encoder'
import type { Attribute, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { TreeModel, TreeNode } from '../tree-model'

export abstract class TreeBuilder<Root extends TreeNode<unknown[]>> {
  private nodeIdMapping: Record<string, `id_${number}`> = {}
  private id_counter = 0
  protected nodeCount = 0
  readonly #idMapping: Record<string, string> = {}

  public readonly treeModel: TreeModel<Root>

  public constructor(model: GraphModel, private readonly featureContext: FeatureContext, private readonly replaceNodeIds: boolean) {
    model.nodes.forEach((node) => this.registerNode(node))
    this.treeModel = this.createTreeModel(model.root)
  }

  protected get idMapping(): Readonly<Record<string, string>> {
    return this.#idMapping
  }

  public registerNode(node: GraphNode): void {
    if (this.replaceNodeIds) {
      this.nodeIdMapping[requireId(node)] = `id_${this.id_counter++}`
    }
  }

  protected abstract createTreeModel(rootNode: GraphNode): TreeModel<Root>

  protected mapId(node: GraphNode): string {
    const idAttribute = node.attributes.get(node.model.settings.idAttribute)
    if (!idAttribute) {
      throw new Error('Node has an id attribute. Tree encoding requires all nodes to have IDs assigned.')
    }
    const mappedId = this.mapAttribute(idAttribute)
    this.#idMapping[mappedId] = idAttribute.value.literal
    return mappedId
  }

  protected mapAttribute(attribute: Attribute): string {
    const mappedId = this.nodeIdMapping[attribute.value.literal]
    if (mappedId) {
      // attribute value is a node id
      return mappedId
    }
    return `${this.featureContext.mapNodeAttribute(attribute)}`
    // TODO/Jan: Enable less concise version via parameter?
    return `${attribute.name}_${attribute.type}_${this.featureContext.mapNodeAttribute(attribute)}`
  }

  private includeAttribute(attribute: Attribute) {
    return !this.featureContext.onlyEncodedFeatures || this.featureContext.canEncodeNodeAttribute(attribute)
  }

  protected createNode<T extends TreeNode<unknown[]>>(node: T): T {
    this.nodeCount++
    return node
  }

  protected getFilteredAttributes(node: GraphNode) {
    return Stream
      .from(node.attributes.values())
      .filter((attribute) => this.includeAttribute(attribute))
      // do not include the node's identifier in the regular attributes
      .filter((attribute) => attribute.value.literal !== node.id)
  }
}

export function requireId(node: GraphNode): string {
  if (!node.id) {
    throw new Error('Node has no id. Tree encoding requires all nodes to have IDs assigned.')
  }
  return node.id
}
