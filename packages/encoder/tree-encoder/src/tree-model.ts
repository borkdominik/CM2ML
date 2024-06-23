export const treeFormats = ['compact', 'local', 'global'] as const

export function isValidTreeFormat(format: string): format is TreeFormat {
  return treeFormats.includes(format as TreeFormat)
}

export type TreeFormat = typeof treeFormats[number]

export type TreeNodeValue = string | number

/**
 * Key-value mapping from new node ids to original node ids.
 */
export type IdMapping = Record<TreeNodeValue, TreeNodeValue>

export interface TreeModel<Root extends TreeNode<unknown[]>> {
  readonly root: Root
  readonly numNodes: number
  readonly format: TreeFormat
  readonly idMapping: IdMapping
}

export interface TreeNode<Children extends unknown[]> {
  readonly value: TreeNodeValue
  readonly children: Children
  readonly isStaticNode: boolean
}

export type RecursiveTreeNode = TreeNode<RecursiveTreeNode[]>
