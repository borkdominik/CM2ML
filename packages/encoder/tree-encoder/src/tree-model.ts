export const treeFormats = ['compact', 'local', 'global'] as const

export function isValidTreeFormat(format: string): format is TreeFormat {
  return treeFormats.includes(format as TreeFormat)
}

export type TreeFormat = typeof treeFormats[number]

export interface TreeModel<Root extends TreeNode<unknown[]>> {
  readonly root: Root
  readonly numNodes: number
  readonly format: TreeFormat
  readonly idMapping: Record<string, string>
}

export interface TreeNode<Children extends unknown[]> {
  readonly value: string
  readonly children: Children
  readonly isStaticNode: boolean
}

export type RecursiveTreeNode = TreeNode<RecursiveTreeNode[]>
