export const treeFormats = ['local', 'global'] as const

export type TreeFormat = typeof treeFormats[number]

export interface TreeModel<Root extends TreeNode<unknown[]>> {
  readonly root: Root
  readonly numNodes: number
  readonly format: TreeFormat
}

export interface TreeNode<Children extends unknown[]> {
  readonly value: string
  readonly children: Children
  readonly isStaticNode: boolean
}

export type RecursiveTreeNode = TreeNode<RecursiveTreeNode[]>
