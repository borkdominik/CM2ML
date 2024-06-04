export interface TreeModel {
  readonly root: RootNode
}

export interface TreeNode {
  readonly value?: string
  readonly children?: TreeNode[]
  readonly isStaticNode: boolean
}

export interface RootNode extends TreeNode {
  /**
   * Contains the classes of the model.
   */
  readonly value: 'MODEL'
  readonly children: ClassNode[]
  readonly isStaticNode: true
}

export interface ClassNode extends TreeNode {
  readonly value: 'CLS'
  readonly children: [NameNode, AttributesNode, AssociationsNode]
  readonly isStaticNode: true
}

export interface NameNode extends TreeNode {
  readonly value: 'NAME'
  readonly children: [NameValueNode]
  readonly isStaticNode: true
}

export interface NameValueNode extends TreeNode {
  /**
   * The name of the class.
   */
  readonly value: string
  readonly children?: never
  readonly isStaticNode: false
}

export interface AttributesNode extends TreeNode {
  readonly value: 'ATTR'
  readonly children: AttributeNameNode[]
  readonly isStaticNode: true
}

export interface AttributeNameNode extends TreeNode {
  /**
   * The name of the attribute.
   */
  readonly value: string
  readonly children: [AttributeValueNode]
  readonly isStaticNode: false
}

export interface AttributeValueNode extends TreeNode {
  /**
   * The value of the attribute.
   */
  readonly value: string
  readonly children?: never
  readonly isStaticNode: false
}

export interface AssociationsNode extends TreeNode {
  readonly value: 'ASSOC'
  readonly children: AssociationTargetNode[]
  readonly isStaticNode: true
}

export interface AssociationTargetNode extends TreeNode {
  /**
   * The target of the association.
   */
  readonly value: string
  readonly children: [AssociationTypeNode]
  readonly isStaticNode: false
}

export interface AssociationTypeNode extends TreeNode {
  /**
   * The type of the association.
   */
  readonly value: string
  readonly children?: never
  readonly isStaticNode: false
}
