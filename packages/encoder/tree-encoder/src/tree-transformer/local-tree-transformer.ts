import type { Attribute, GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { TreeModel, TreeNode } from '../tree-model'

import { TreeTransformer } from './tree-transformer'

export interface LocalRootNode extends TreeNode<LocalClassNode[]> {
  /**
   * Contains the classes of the model.
   */
  readonly value: 'MODEL'
  readonly children: LocalClassNode[]
  readonly isStaticNode: true
}

export interface LocalClassNode extends TreeNode<[LocalNameNode, LocalAttributesNode, LocalAssociationsNode]> {
  readonly value: 'CLS'
  readonly isStaticNode: true
}

export interface LocalNameNode extends TreeNode<[LocalNameValueNode]> {
  readonly value: 'NAME'
  readonly isStaticNode: true
}

export interface LocalNameValueNode extends TreeNode<[]> {
  /**
   * The name of the class.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface LocalAttributesNode extends TreeNode<LocalAttributeNameNode[]> {
  readonly value: 'ATTRS'
  readonly isStaticNode: true
}

export interface LocalAttributeNameNode extends TreeNode<[LocalAttributeValueNode]> {
  /**
   * The name of the attribute.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface LocalAttributeValueNode extends TreeNode<[]> {
  /**
   * The value of the attribute.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface LocalAssociationsNode extends TreeNode<LocalAssociationTargetNode[]> {
  readonly value: 'ASSOCS'
  readonly isStaticNode: true
}

export interface LocalAssociationTargetNode extends TreeNode<[LocalAssociationTypeNode]> {
  /**
   * The target of the association.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface LocalAssociationTypeNode extends TreeNode<[]> {
  /**
   * The type of the association.
   */
  readonly value: string
  readonly isStaticNode: false
}

export class LocalTreeTransformer extends TreeTransformer<LocalRootNode> {
  protected override createTreeModel(rootNode: GraphNode): TreeModel<LocalRootNode> {
    const root = this.createRootNode(rootNode.model)
    return {
      root,
      numNodes: this.nodeCount,
      format: 'local',
    }
  }

  private createRootNode(model: GraphModel): LocalRootNode {
    return this.createNode({
      value: 'MODEL',
      children: this.createClassNodes(model),
      isStaticNode: true,
    })
  }

  private createClassNodes(model: GraphModel): LocalClassNode[] {
    return Stream.from(model.nodes).map((node) => this.createClassNode(node)).toArray()
  }

  private createClassNode(node: GraphNode): LocalClassNode {
    return this.createNode({
      value: 'CLS',
      children: [this.createNameNode(node), this.createAttributesNode(node), this.createAssociationsNode(node)],
      isStaticNode: true,
    })
  }

  private createNameNode(node: GraphNode): LocalNameNode {
    return this.createNode({
      value: 'NAME',
      children: [this.createNameValueNode(node)],
      isStaticNode: true,
    })
  }

  private createNameValueNode(node: GraphNode): LocalNameValueNode {
    return this.createNode({
      value: this.mapId(node),
      children: [],
      isStaticNode: false,
    })
  }

  private createAttributesNode(node: GraphNode): LocalAttributesNode {
    return this.createNode({
      value: 'ATTRS',
      children: this.createAttributeNameNodes(node),
      isStaticNode: true,
    })
  }

  private createAttributeNameNodes(node: GraphNode): LocalAttributeNameNode[] {
    return Stream
      .from(node.attributes.values())
      .map((attribute) => this.createAttributeNameNode(attribute))
      .filterNonNull()
      .toArray()
  }

  private createAttributeNameNode(attribute: Attribute): LocalAttributeNameNode | null {
    if (this.featureContext.onlyEncodedFeatures && !this.featureContext.canEncodeNodeAttribute(attribute)) {
      return null
    }
    return this.createNode({
      value: attribute.name,
      children: [this.createAttributeValueNode(attribute)] as const,
      isStaticNode: false,
    })
  }

  private createAttributeValueNode(attribute: Attribute): LocalAttributeValueNode {
    return this.createNode({
      value: this.mapAttribute(attribute),
      children: [],
      isStaticNode: false,
    })
  }

  private createAssociationsNode(node: GraphNode): LocalAssociationsNode {
    return this.createNode({
      value: 'ASSOCS',
      children: this.createAssociationTargetNodes(node),
      isStaticNode: true,
    })
  }

  private createAssociationTargetNodes(node: GraphNode): LocalAssociationTargetNode[] {
    return Stream.from(node.outgoingEdges).map((edge) => this.createAssociationTargetNode(edge)).toArray()
  }

  private createAssociationTargetNode(edge: GraphEdge): LocalAssociationTargetNode {
    return this.createNode({
      value: this.mapId(edge.target),
      children: [this.createAssociationTypeNode(edge)],
      isStaticNode: false,
    })
  }

  private createAssociationTypeNode(edge: GraphEdge): LocalAssociationTypeNode {
    return this.createNode({
      value: edge.tag,
      children: [],
      isStaticNode: false,
    })
  }
}
