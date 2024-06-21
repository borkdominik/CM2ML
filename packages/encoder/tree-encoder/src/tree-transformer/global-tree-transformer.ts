import type { Attribute, GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { TreeModel, TreeNode } from '../tree-model'

import { TreeTransformer } from './tree-transformer'

export interface GlobalRootNode extends TreeNode<(GlobalObjectNode | GlobalAssociationNode)[]> {
  /**
   * Contains the classes of the model.
   */
  readonly value: 'MODEL'
  readonly children: (GlobalObjectNode | GlobalAssociationNode)[]
  readonly isStaticNode: true
}

export interface GlobalObjectNode extends TreeNode<[GlobalIdentifierNode, GlobalAttributesNode]> {
  readonly value: 'OBJ'
  readonly isStaticNode: true
}

export interface GlobalIdentifierNode extends TreeNode<[]> {
  /**
   * The unique identifier of the node.
   */
  readonly value: string
  readonly isStaticNode: true
}

export interface GlobalAttributesNode extends TreeNode<GlobalAttributeNameNode[]> {
  readonly value: 'ATTS'
  readonly isStaticNode: true
}

export interface GlobalAttributeNameNode extends TreeNode<[GlobalAttributeValueNode]> {
  /**
   * The name of the attribute.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface GlobalAttributeValueNode extends TreeNode<[]> {
  /**
   * The value of the attribute.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface GlobalAssociationNode extends TreeNode<[GlobalAssociationTypeNode, GlobalAssociationSourceNode, GlobalAssociationTargetNode]> {
  readonly value: 'ASSOC'
  readonly isStaticNode: true
}

export interface GlobalAssociationTypeNode extends TreeNode<[]> {
  /**
   * The type of the association.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface GlobalAssociationSourceNode extends TreeNode<[]> {
  /**
   * The target of the association.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface GlobalAssociationTargetNode extends TreeNode<[]> {
  /**
   * The target of the association.
   */
  readonly value: string
  readonly isStaticNode: false
}

export class GlobalTreeTransformer extends TreeTransformer<GlobalRootNode> {
  protected override createTreeModel(rootNode: GraphNode): TreeModel<GlobalRootNode> {
    const root = this.createRootNode(rootNode.model)
    return {
      root,
      numNodes: this.nodeCount,
      format: 'global',
    }
  }

  private createRootNode(model: GraphModel): GlobalRootNode {
    return this.createNode({
      value: 'MODEL',
      children: Stream
        .empty<GlobalObjectNode | GlobalAssociationNode>()
        .concat(
          this.createObjNodes(model),
          this.createAssociationNodes(model),
        )
        .toArray(),
      isStaticNode: true,
    })
  }

  private createObjNodes(model: GraphModel): Stream<GlobalObjectNode> {
    return Stream.from(model.nodes).map((node) => this.createObjNode(node))
  }

  private createObjNode(node: GraphNode): GlobalObjectNode {
    return this.createNode({
      value: 'OBJ',
      children: [this.createIdentifierNode(node), this.createAttributesNode(node)],
      isStaticNode: true,
    })
  }

  private createIdentifierNode(node: GraphNode): GlobalIdentifierNode {
    return this.createNode({
      value: this.mapId(node),
      children: [],
      isStaticNode: true,
    })
  }

  private createAttributesNode(node: GraphNode): GlobalAttributesNode {
    return this.createNode({
      value: 'ATTS',
      children: this.createAttributeNameNodes(node),
      isStaticNode: true,
    })
  }

  private createAttributeNameNodes(node: GraphNode): GlobalAttributeNameNode[] {
    return this
      .getFilteredAttributes(node)
      .map((attribute) => this.createAttributeNameNode(attribute))
      .toArray()
  }

  private createAttributeNameNode(attribute: Attribute): GlobalAttributeNameNode {
    return this.createNode({
      value: attribute.name,
      children: [this.createAttributeValueNode(attribute)] as const,
      isStaticNode: false,
    })
  }

  private createAttributeValueNode(attribute: Attribute): GlobalAttributeValueNode {
    return this.createNode({
      value: this.mapAttribute(attribute),
      children: [],
      isStaticNode: false,
    })
  }

  private createAssociationNodes(model: GraphModel): Stream<GlobalAssociationNode> {
    return Stream.from(model.edges).map((edge) => this.createAssociationNode(edge))
  }

  private createAssociationNode(edge: GraphEdge): GlobalAssociationNode {
    return this.createNode({
      value: 'ASSOC',
      children: [this.createAssociationTypeNode(edge), this.createAssociationSourceNode(edge), this.createAssociationTargetNode(edge)],
      isStaticNode: true,
    })
  }

  private createAssociationTypeNode(edge: GraphEdge): GlobalAssociationTypeNode {
    return this.createNode({
      value: edge.tag,
      children: [],
      isStaticNode: false,
    })
  }

  private createAssociationSourceNode(edge: GraphEdge): GlobalAssociationTargetNode {
    return this.createNode({
      value: this.mapId(edge.source),
      children: [],
      isStaticNode: false,
    })
  }

  private createAssociationTargetNode(edge: GraphEdge): GlobalAssociationTargetNode {
    return this.createNode({
      value: this.mapId(edge.target),
      children: [],
      isStaticNode: false,
    })
  }
}
