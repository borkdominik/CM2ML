export interface TreeModel {
  readonly root: RootNode
  readonly numNodes: number
}

export interface TreeNode<Children extends unknown[]> {
  readonly value: string
  readonly children: Children
  readonly isStaticNode: boolean
}

export type RecursiveTreeNode = TreeNode<RecursiveTreeNode[]>

export interface RootNode extends TreeNode<ClassNode[]> {
  /**
   * Contains the classes of the model.
   */
  readonly value: 'MODEL'
  readonly children: ClassNode[]
  readonly isStaticNode: true
}

export interface ClassNode extends TreeNode<[NameNode, AttributesNode, AssociationsNode]> {
  readonly value: 'CLS'
  readonly isStaticNode: true
}

export interface NameNode extends TreeNode<[NameValueNode]> {
  readonly value: 'NAME'
  readonly isStaticNode: true
}

export interface NameValueNode extends TreeNode<[]> {
  /**
   * The name of the class.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface AttributesNode extends TreeNode<AttributeNameNode[]> {
  readonly value: 'ATTR'
  readonly isStaticNode: true
}

export interface AttributeNameNode extends TreeNode<[AttributeValueNode]> {
  /**
   * The name of the attribute.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface AttributeValueNode extends TreeNode<[]> {
  /**
   * The value of the attribute.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface AssociationsNode extends TreeNode<AssociationTargetNode[]> {
  readonly value: 'ASSOC'
  readonly isStaticNode: true
}

export interface AssociationTargetNode extends TreeNode<[AssociationTypeNode]> {
  /**
   * The target of the association.
   */
  readonly value: string
  readonly isStaticNode: false
}

export interface AssociationTypeNode extends TreeNode<[]> {
  /**
   * The type of the association.
   */
  readonly value: string
  readonly isStaticNode: false
}
