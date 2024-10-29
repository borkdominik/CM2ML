import type { Attribute, GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { TreeModel, TreeNode } from '../tree-model'

import { TreeBuilder } from './tree-builder'

export interface CompactRootNode extends TreeNode<CompactClassNode[]> {
  /**
   * Contains the classes of the model.
   */
  readonly value: 'MODEL'
  readonly children: CompactClassNode[]
  readonly isStaticNode: true
}

export interface CompactClassNode extends TreeNode<[CompactAttributesNode, CompactAssociationsNode]> {
  readonly value: string
  readonly isStaticNode: false
}

export interface CompactAttributesNode extends TreeNode<CompactAttributeNameNode[]> {
  readonly value: 'ATTRS'
  readonly isStaticNode: true
}

export interface CompactAttributeNameNode extends TreeNode<[CompactAttributeValueNode]> {
  /**
   * The name of the attribute.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface CompactAttributeValueNode extends TreeNode<[]> {
  /**
   * The value of the attribute.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface CompactAssociationsNode extends TreeNode<CompactAssociationTargetNode[]> {
  readonly value: 'ASSOCS'
  readonly isStaticNode: true
}

export interface CompactAssociationTargetNode extends TreeNode<[CompactAssociationTypeNode]> {
  /**
   * The target of the association.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface CompactAssociationTypeNode extends TreeNode<[]> {
  /**
   * The type of the association.
   */
  readonly value: string
  readonly isStaticNode: false
}

export class CompactTreeBuilder extends TreeBuilder<CompactRootNode> {
  protected override createTreeModel(model: GraphModel): TreeModel<CompactRootNode> {
    const root = this.createRootNode(model)
    return {
      root,
      numNodes: this.nodeCount,
      format: 'compact',
      nodeIdMapping: this.nodeIdMapping,
    }
  }

  private createRootNode(model: GraphModel): CompactRootNode {
    return this.createNode({
      value: 'MODEL',
      children: this.createClassNodes(model),
      isStaticNode: true,
    })
  }

  private createClassNodes(model: GraphModel): CompactClassNode[] {
    return Stream.from(model.nodes).map((node) => this.createClassNode(node)).toArray()
  }

  private createClassNode(node: GraphNode): CompactClassNode {
    return this.createNode({
      value: this.mapId(node),
      children: [this.createAttributesNode(node), this.createAssociationsNode(node)],
      isStaticNode: false,
    })
  }

  private createAttributesNode(node: GraphNode): CompactAttributesNode {
    return this.createNode({
      value: 'ATTRS',
      children: this.createAttributeNameNodes(node),
      isStaticNode: true,
    })
  }

  private createAttributeNameNodes(node: GraphNode): CompactAttributeNameNode[] {
    return this
      .getFilteredAttributes(node)
      .map((attribute) => this.createAttributeNameNode(attribute))
      .toArray()
  }

  private createAttributeNameNode(attribute: Attribute): CompactAttributeNameNode {
    return this.createNode({
      value: attribute.name,
      children: [this.createAttributeValueNode(attribute)] as const,
      isStaticNode: false,
    })
  }

  private createAttributeValueNode(attribute: Attribute): CompactAttributeValueNode {
    return this.createNode({
      value: this.mapAttribute(attribute),
      children: [],
      isStaticNode: false,
    })
  }

  private createAssociationsNode(node: GraphNode): CompactAssociationsNode {
    return this.createNode({
      value: 'ASSOCS',
      children: this.createAssociationTargetNodes(node),
      isStaticNode: true,
    })
  }

  private createAssociationTargetNodes(node: GraphNode): CompactAssociationTargetNode[] {
    return Stream.from(node.outgoingEdges).map((edge) => this.createAssociationTargetNode(edge)).toArray()
  }

  private createAssociationTargetNode(edge: GraphEdge): CompactAssociationTargetNode {
    return this.createNode({
      value: this.mapId(edge.target),
      children: [this.createAssociationTypeNode(edge)],
      isStaticNode: false,
    })
  }

  private createAssociationTypeNode(edge: GraphEdge): CompactAssociationTypeNode {
    return this.createNode({
      value: edge.tag,
      children: [],
      isStaticNode: false,
    })
  }
}
