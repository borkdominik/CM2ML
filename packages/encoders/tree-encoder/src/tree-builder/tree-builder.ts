import type { FeatureContext } from '@cm2ml/feature-encoder'
import type { Attribute, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { NodeIdMapping, TreeModel, TreeNode } from '../tree-model'

export interface TreeBuilderSettings {
  replaceNodeIds: boolean
  verboseFeatureValues: boolean
}

export abstract class TreeBuilder<Root extends TreeNode<unknown[]>> {
  /**
   * A mapping from the original node IDs to the generated node IDs.
   */
  private generatedNodeIdMapping: Record<string, `id_${number}`> = {}
  private id_counter = 0
  protected nodeCount = 0
  /**
   * A mapping from the generated node IDs to the original node IDs.
   */
  readonly #nodeIdMapping: NodeIdMapping = {}

  public readonly treeModel: TreeModel<Root>

  public constructor(model: GraphModel, private readonly featureContext: FeatureContext, private readonly settings: TreeBuilderSettings) {
    model.nodes.forEach((node) => this.registerNode(node))
    this.treeModel = this.createTreeModel(model)
  }

  protected get nodeIdMapping(): NodeIdMapping {
    return this.#nodeIdMapping
  }

  public registerNode(node: GraphNode): void {
    if (this.settings.replaceNodeIds) {
      this.generatedNodeIdMapping[this.requireId(node)] = `id_${this.id_counter++}`
    }
  }

  protected requireId(node: GraphNode): string {
    if (!node.id) {
      throw new Error('Node has no id. Tree encoding requires all nodes to have IDs assigned.')
    }
    return node.id
  }

  protected requireTypeAttribute(node: GraphNode): Attribute {
    const typeAttribute = node.typeAttribute
    if (!typeAttribute) {
      throw new Error('Node has no type attribute. Tree encoding requires all nodes to have types assigned.')
    }
    return typeAttribute
  }

  protected abstract createTreeModel(model: GraphModel): TreeModel<Root>

  protected mapId(node: GraphNode): string {
    const idAttribute = node.idAttribute
    if (!idAttribute) {
      throw new Error('Node has an id attribute. Tree encoding requires all nodes to have IDs assigned.')
    }
    const mappedId = this.mapAttribute(idAttribute)
    this.#nodeIdMapping[mappedId] = idAttribute.value.literal
    return mappedId
  }

  protected mapAttribute(attribute: Attribute): string {
    const mappedId = this.generatedNodeIdMapping[attribute.value.literal]
    if (mappedId) {
      // attribute value is a node id
      return mappedId
    }
    if (this.settings.verboseFeatureValues) {
      return `${attribute.name}_${attribute.type}_${this.featureContext.mapNodeAttribute(attribute)}`
    }
    return `${this.featureContext.mapNodeAttribute(attribute)}`
  }

  private includeAttribute(attribute: Attribute) {
    return !this.featureContext.staticData.onlyEncodedFeatures || this.featureContext.canEncodeNodeAttribute(attribute)
  }

  protected createNode<T extends TreeNode<unknown[]>>(node: T): T {
    this.nodeCount++
    return node
  }

  protected getFilteredAttributes(node: GraphNode): Stream<Attribute> {
    const idAttribute = node.idAttribute
    return Stream
      .from(node.attributes.values())
      .filter((attribute) => this.includeAttribute(attribute))
      // do not include the node's identifier in the regular attributes
      .filter((attribute) => attribute !== idAttribute)
  }
}
