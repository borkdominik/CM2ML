import type { Id2WordMapping, NodeIdMapping, RecursiveTreeNode, TreeNodeValue, Word2IdMapping } from '@cm2ml/builtin'

export type TreeEncodingFlowNode = Omit<RecursiveTreeNode, 'children'> & {
  id: string
  children: TreeEncodingFlowNode[]
  color?: string
  parent?: TreeEncodingFlowNode
  nodeIdMapping: NodeIdMapping
  reverseNodeIdMapping: NodeIdMapping
  id2WordMapping: Id2WordMapping
  word2IdMapping: Word2IdMapping
  selection: TreeNodeValue | [TreeNodeValue, TreeNodeValue] | undefined
}
