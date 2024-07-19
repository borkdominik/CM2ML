import type { Id2WordMapping, NodeIdMapping, RecursiveTreeNode, TreeNodeValue, Word2IdMapping } from '@cm2ml/builtin'
import type { Edge, Node } from 'reactflow'

export interface SizeConfig {
  width: number
  height: number
  horizontalSpacing: number
  verticalSpacing: number
}

export type FlowNode = Omit<RecursiveTreeNode, 'children'> & {
  id: string
  children: FlowNode[]
  color?: string
  parent?: FlowNode
  nodeIdMapping: NodeIdMapping
  reverseNodeIdMapping: NodeIdMapping
  id2WordMapping: Id2WordMapping
  word2IdMapping: Word2IdMapping
  selection: TreeNodeValue | [TreeNodeValue, TreeNodeValue] | undefined
}

export interface FlowGraphModel {
  edges: Edge<unknown>[]
  nodes: Node<FlowNode>[]
  sizeConfig: SizeConfig
  type: 'tree' | 'sugiyama'
}
