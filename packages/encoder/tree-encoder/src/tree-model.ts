export interface TreeModel {
  readonly root: RootNode
}

export interface TreeNode {
  readonly value?: string
  readonly children?: TreeNode[]
}

export interface RootNode extends TreeNode {
  /**
   * Contains the classes of the model.
   */
  readonly children: ClassNode[]
}

export interface ClassNode extends TreeNode {
  readonly value: 'CLS'
  readonly children: [NameNode, AttributesNode, AssociationsNode]
}

export interface NameNode extends TreeNode {
  readonly value: 'NAME'
  readonly children: [NameValueNode]
}

export interface NameValueNode extends TreeNode {
  /**
   * The name of the class.
   */
  readonly value: string
  readonly children?: never
}

export interface AttributesNode extends TreeNode {
  readonly value: 'ATTR'
  readonly children: AttributeNameNode[]
}

export interface AttributeNameNode extends TreeNode {
  /**
   * The name of the attribute.
   */
  readonly value: string
  readonly children: [AttributeValueNode]
}

export interface AttributeValueNode extends TreeNode {
  /**
   * The value of the attribute.
   */
  readonly value: string
  readonly children?: never
}

export interface AssociationsNode extends TreeNode {
  readonly value: 'ASSOC'
  readonly children: AssociationTargetNode[]
}

export interface AssociationTargetNode extends TreeNode {
  /**
   * The target of the association.
   */
  readonly value: string
  readonly children: [AssociationTypeNode]
}

export interface AssociationTypeNode extends TreeNode {
  /**
   * The type of the association.
   */
  readonly value: string
  readonly children?: never
}
