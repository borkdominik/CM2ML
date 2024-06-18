import type { FeatureContext } from '@cm2ml/feature-encoder'
import type { Attribute, GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { AssociationTargetNode, AssociationTypeNode, AssociationsNode, AttributeNameNode, AttributeValueNode, AttributesNode, ClassNode, NameNode, NameValueNode, RootNode, TreeModel } from './tree-model'

class TreeMapperContext {
  private nodeIdMapping: Record<string, `id_${number}`> = {}
  private id_counter = 0
  #nodeCount = 0

  public constructor(public readonly featureContext: FeatureContext, private readonly replaceNodeIds: boolean) { }

  public get nodeCount() {
    return this.#nodeCount
  }

  public registerNode(node: GraphNode): void {
    if (this.replaceNodeIds) {
      this.nodeIdMapping[requireId(node)] = `id_${this.id_counter++}`
    }
  }

  private mapId(node: GraphNode): string {
    const idAttribute = node.attributes.get(node.model.settings.idAttribute)
    if (!idAttribute) {
      throw new Error('Node has an id attribute. Tree encoding requires all nodes to have IDs assigned.')
    }
    return this.mapAttribute(idAttribute)
  }

  private mapAttribute(attribute: Attribute): string {
    const mappedId = this.nodeIdMapping[attribute.value.literal]
    if (mappedId) {
      // attribute value is a node id
      return mappedId
    }
    return `${this.featureContext.mapNodeAttribute(attribute)}`
    return `${attribute.name}_${attribute.type}_${this.featureContext.mapNodeAttribute(attribute)}`
  }

  public createRootNode(model: GraphModel): RootNode {
    this.#nodeCount++
    return {
      value: 'MODEL',
      children: this.createClassNodes(model),
      isStaticNode: true,
    }
  }

  private createClassNodes(model: GraphModel): ClassNode[] {
    return Stream.from(model.nodes).map((node) => this.createClassNode(node)).toArray()
  }

  private createClassNode(node: GraphNode): ClassNode {
    this.#nodeCount++
    return {
      value: 'CLS',
      children: [this.createNameNode(node), this.createAttributesNode(node), this.createAssociationsNode(node)],
      isStaticNode: true,
    }
  }

  private createNameNode(node: GraphNode): NameNode {
    this.#nodeCount++
    return {
      value: 'NAME',
      children: [this.createNameValueNode(node)],
      isStaticNode: true,
    }
  }

  private createNameValueNode(node: GraphNode): NameValueNode {
    this.#nodeCount++
    return {
      value: this.mapId(node), // TODO/Jan: e.g., xmi:type for UML
      children: [],
      isStaticNode: false,
    }
  }

  private createAttributesNode(node: GraphNode): AttributesNode {
    this.#nodeCount++
    return {
      value: 'ATTR',
      children: this.createAttributeNameNodes(node),
      isStaticNode: true,
    }
  }

  private createAttributeNameNodes(node: GraphNode): AttributeNameNode[] {
    return Stream
      .from(node.attributes.values())
      .map((attribute) => this.createAttributeNameNode(attribute))
      .filterNonNull()
      .toArray()
  }

  private createAttributeNameNode(attribute: Attribute): AttributeNameNode | null {
    if (this.featureContext.onlyEncodedFeatures && !this.featureContext.canEncodeNodeAttribute(attribute)) {
      return null
    }
    this.#nodeCount++
    return {
      value: attribute.name,
      children: [this.createAttributeValueNode(attribute)],
      isStaticNode: false,
    }
  }

  private createAttributeValueNode(attribute: Attribute): AttributeValueNode {
    this.#nodeCount++
    return {
      value: this.mapAttribute(attribute),
      children: [],
      isStaticNode: false,
    }
  }

  private createAssociationsNode(node: GraphNode): AssociationsNode {
    this.#nodeCount++
    return {
      value: 'ASSOC',
      children: this.createAssociationTargetNodes(node),
      isStaticNode: true,
    }
  }

  private createAssociationTargetNodes(node: GraphNode): AssociationTargetNode[] {
    return Stream.from(node.outgoingEdges).map((edge) => this.createAssociationTargetNode(edge)).toArray()
  }

  private createAssociationTargetNode(edge: GraphEdge): AssociationTargetNode {
    this.#nodeCount++
    return {
      value: this.mapId(edge.target), // TODO/Jan
      children: [this.createAssociationTypeNode(edge)],
      isStaticNode: false,
    }
  }

  private createAssociationTypeNode(edge: GraphEdge): AssociationTypeNode {
    this.#nodeCount++
    return {
      value: edge.tag,
      children: [],
      isStaticNode: false,
    }
  }
}

function requireId(node: GraphNode): string {
  if (!node.id) {
    throw new Error('Node has no id. Tree encoding requires all nodes to have IDs assigned.')
  }
  return node.id
}

export function createTree(model: GraphModel, featureContext: FeatureContext, replaceNodeIds: boolean) {
  const context = new TreeMapperContext(featureContext, replaceNodeIds)
  model.nodes.forEach((node) => context.registerNode(node))
  const tree: TreeModel = {
    root: context.createRootNode(model),
    numNodes: context.nodeCount,
  }
  return {
    data: tree,
    metadata: {
      nodeFeatures: featureContext.nodeFeatures,
      edgeFeatures: featureContext.edgeFeatures,
    },
  }
}
