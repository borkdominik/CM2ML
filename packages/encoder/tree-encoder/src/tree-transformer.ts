import type { Attribute, GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { AssociationTargetNode, AssociationTypeNode, AssociationsNode, AttributeNameNode, AttributeValueNode, AttributesNode, ClassNode, NameNode, NameValueNode, TreeModel } from './tree-model'

class TreeMapperContext {
  private nodeIdMapping: Record<string, `id_${number}`> = {}
  private id_counter = 0

  public constructor(private readonly replaceNodeIds: boolean) {}

  public registerNode(node: GraphNode): void {
    if (this.replaceNodeIds) {
      this.nodeIdMapping[requireId(node)] = `id_${this.id_counter++}`
    }
  }

  public mapId(node: GraphNode): string {
    return this.nodeIdMapping[requireId(node)] ?? requireId(node)
  }

  public mapAttribute(attribute: Attribute): string {
    return this.nodeIdMapping[attribute.value.literal] ?? attribute.value.literal
  }
}

function requireId(node: GraphNode): string {
  if (!node.id) {
    throw new Error('Node has no id. Tree encoding requires all nodes to have IDs assigned.')
  }
  return node.id
}

export function createTree(model: GraphModel, replaceNodeIds: boolean): TreeModel {
  const context = new TreeMapperContext(replaceNodeIds)
  return {
    root: {
      value: 'MODEL',
      children: createClassNodes(model, context),
      isStaticNode: true,
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
  return Stream.from(node.attributes.values()).map((attribute) => createAttributeNameNode(attribute, context)).toArray()
}

function createAttributeNameNode(attribute: Attribute, context: TreeMapperContext): AttributeNameNode {
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
