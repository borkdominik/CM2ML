import type { FeatureContext } from '@cm2ml/feature-encoder'
import type { Attribute, GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { AssociationTargetNode, AssociationTypeNode, AssociationsNode, AttributeNameNode, AttributeValueNode, AttributesNode, ClassNode, NameNode, NameValueNode, TreeModel } from './tree-model'

class TreeMapperContext {
  private nodeIdMapping: Record<string, `id_${number}`> = {}
  private id_counter = 0

  public constructor(public readonly featureContext: FeatureContext, private readonly replaceNodeIds: boolean) {}

  public registerNode(node: GraphNode): void {
    if (this.replaceNodeIds) {
      this.nodeIdMapping[requireId(node)] = `id_${this.id_counter++}`
    }
  }

  public mapId(node: GraphNode): string {
    const idAttribute = node.attributes.get(node.model.settings.idAttribute)
    if (!idAttribute) {
      throw new Error('Node has an id attribute. Tree encoding requires all nodes to have IDs assigned.')
    }
    return this.mapAttribute(idAttribute)
  }

  public mapAttribute(attribute: Attribute): string {
    const mappedId = this.nodeIdMapping[attribute.value.literal]
    if (mappedId) {
      // attribute value is a node id
      return mappedId
    }
    return `${this.featureContext.mapNodeAttribute(attribute)}`
    return `${attribute.name}_${attribute.type}_${this.featureContext.mapNodeAttribute(attribute)}`
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
    root: {
      value: 'MODEL',
      children: createClassNodes(model, context),
      isStaticNode: true,
    },
  }
  return {
    data: tree,
    metadata: {
      nodeFeatures: featureContext.nodeFeatures,
      edgeFeatures: featureContext.edgeFeatures,
    },
  }
}

function createClassNodes(model: GraphModel, context: TreeMapperContext): ClassNode[] {
  return Stream.from(model.nodes).map((node) => createClassNode(node, context)).toArray()
}

function createClassNode(node: GraphNode, context: TreeMapperContext): ClassNode {
  return {
    value: 'CLS',
    children: [createNameNode(node, context), createAttributesNode(node, context), createAssociationsNode(node, context)],
    isStaticNode: true,
  }
}

function createNameNode(node: GraphNode, context: TreeMapperContext): NameNode {
  return {
    value: 'NAME',
    children: [createNameValueNode(node, context)],
    isStaticNode: true,
  }
}

function createNameValueNode(node: GraphNode, context: TreeMapperContext): NameValueNode {
  return {
    value: context.mapId(node), // TODO/Jan: e.g., xmi:type for UML
    children: [],
    isStaticNode: false,
  }
}

function createAttributesNode(node: GraphNode, context: TreeMapperContext): AttributesNode {
  return {
    value: 'ATTR',
    children: createAttributeNameNodes(node, context),
    isStaticNode: true,
  }
}

function createAttributeNameNodes(node: GraphNode, context: TreeMapperContext): AttributeNameNode[] {
  return Stream
    .from(node.attributes.values())
    .map((attribute) => createAttributeNameNode(attribute, context))
    .filterNonNull()
    .toArray()
}

function createAttributeNameNode(attribute: Attribute, context: TreeMapperContext): AttributeNameNode | null {
  if (context.featureContext.onlyEncodedFeatures && !context.featureContext.canEncodeNodeAttribute(attribute)) {
    return null
  }
  return {
    value: attribute.name,
    children: [createAttributeValueNode(attribute, context)],
    isStaticNode: false,
  }
}

function createAttributeValueNode(attribute: Attribute, context: TreeMapperContext): AttributeValueNode {
  return {
    value: context.mapAttribute(attribute),
    children: [],
    isStaticNode: false,
  }
}

function createAssociationsNode(node: GraphNode, context: TreeMapperContext): AssociationsNode {
  return {
    value: 'ASSOC',
    children: createAssociationTargetNodes(node, context),
    isStaticNode: true,
  }
}

function createAssociationTargetNodes(node: GraphNode, context: TreeMapperContext): AssociationTargetNode[] {
  return Stream.from(node.outgoingEdges).map((edge) => createAssociationTargetNode(edge, context)).toArray()
}

function createAssociationTargetNode(edge: GraphEdge, context: TreeMapperContext): AssociationTargetNode {
  return {
    value: context.mapId(edge.target), // TODO/Jan
    children: [createAssociationTypeNode(edge)],
    isStaticNode: false,
  }
}

function createAssociationTypeNode(edge: GraphEdge): AssociationTypeNode {
  return {
    value: edge.tag,
    children: [],
    isStaticNode: false,
  }
}
