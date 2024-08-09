import type { Edge, Node } from 'reactflow'

export interface TreeSizeConfig {
  width: number
  height: number
  horizontalSpacing: number
  verticalSpacing: number
}

export const treeSizeConfigs = {
  sugiyama: {
    width: 120,
    height: 60,
    horizontalSpacing: 80,
    verticalSpacing: 80,
  },
  tree: {
    width: 80,
    height: 50,
    horizontalSpacing: 20,
    verticalSpacing: 50,
  },
} as const satisfies Record<string, TreeSizeConfig>

export type TreeLayout = 'tree' | 'sugiyama'

export interface TreeFlowGraphModel<NodeType> {
  edges: Edge<unknown>[]
  nodes: Node<NodeType>[]
  sizeConfig: TreeSizeConfig
  type: TreeLayout
}

export interface TreeHierarchy<NodeType> {
  nodes: Node<NodeType>[]
  sizeConfig: TreeSizeConfig
  type: TreeLayout
}
