import type { FeatureContext } from '@cm2ml/feature-encoder'
import type { Attribute, GraphModel, GraphNode } from '@cm2ml/ir'

import type { TreeModel, TreeNode } from '../tree-model'

export abstract class TreeTransformer<Root extends TreeNode<unknown[]>> {
  private nodeIdMapping: Record<string, `id_${number}`> = {}
  private id_counter = 0
  protected nodeCount = 0

  public readonly treeModel: TreeModel<Root>

  public constructor(model: GraphModel, public readonly featureContext: FeatureContext, private readonly replaceNodeIds: boolean) {
    model.nodes.forEach((node) => this.registerNode(node))
    this.treeModel = this.createTreeModel(model.root)
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
    return this.mapAttribute(idAttribute)
  }

  protected mapAttribute(attribute: Attribute): string {
    const mappedId = this.nodeIdMapping[attribute.value.literal]
    if (mappedId) {
      // attribute value is a node id
      return mappedId
    }
    return `${this.featureContext.mapNodeAttribute(attribute)}`
    return `${attribute.name}_${attribute.type}_${this.featureContext.mapNodeAttribute(attribute)}`
  }

  protected createNode<T extends TreeNode<unknown[]>>(node: T): T {
    this.nodeCount++
    return node
  }
}

export function requireId(node: GraphNode): string {
  if (!node.id) {
    throw new Error('Node has no id. Tree encoding requires all nodes to have IDs assigned.')
  }
  return node.id
}
