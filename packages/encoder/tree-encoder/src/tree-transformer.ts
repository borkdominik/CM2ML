import type { Attribute, GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { AssociationTargetNode, AssociationTypeNode, AssociationsNode, AttributeNameNode, AttributeValueNode, AttributesNode, ClassNode, NameNode, NameValueNode, TreeModel } from './tree-model'

function requireId(node: GraphNode): string {
  if (!node.id) {
    throw new Error('Node has no id.')
  }
  return node.id
}

export function createTree(model: GraphModel): TreeModel {
  return {
    root: {
      value: 'model',
      children: createClassNodes(model),
    },
  }
}

function createClassNodes(model: GraphModel): ClassNode[] {
  return Stream.from(model.nodes).map(createClassNode).toArray()
}

function createClassNode(node: GraphNode): ClassNode {
  return {
    value: 'CLS',
    children: [createNameNode(node), createAttributesNode(node), createAssociationsNode(node)],
  }
}

function createNameNode(node: GraphNode): NameNode {
  return {
    value: 'NAME',
    children: [createNameValueNode(node)],
  }
}

function createNameValueNode(node: GraphNode): NameValueNode {
  return {
    value: requireId(node), // TODO: e.g., xmi:type for UML
  }
}

function createAttributesNode(node: GraphNode): AttributesNode {
  return {
    value: 'ATTR',
    children: createAttributeNameNodes(node),
  }
}

function createAttributeNameNodes(node: GraphNode): AttributeNameNode[] {
  return Stream.from(node.attributes.values()).map(createAttributeNameNode).toArray()
}

function createAttributeNameNode(attribute: Attribute): AttributeNameNode {
  return {
    value: attribute.name,
    children: [createAttributeValueNode(attribute)],
  }
}

function createAttributeValueNode(attribute: Attribute): AttributeValueNode {
  return {
    value: attribute.value.literal,
  }
}

function createAssociationsNode(node: GraphNode): AssociationsNode {
  return {
    value: 'ASSOC',
    children: createAssociationTargetNodes(node),
  }
}

function createAssociationTargetNodes(node: GraphNode): AssociationTargetNode[] {
  return Stream.from(node.outgoingEdges).map(createAssociationTargetNode).toArray()
}

function createAssociationTargetNode(edge: GraphEdge): AssociationTargetNode {
  return {
    value: requireId(edge.target), // TODO/Jan
    children: [createAssociationTypeNode(edge)],
  }
}

function createAssociationTypeNode(edge: GraphEdge): AssociationTypeNode {
  return {
    value: edge.tag,
  }
}
