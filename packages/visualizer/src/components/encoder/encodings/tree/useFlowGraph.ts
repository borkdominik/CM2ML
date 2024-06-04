import type { TreeModel, TreeNode } from '@cm2ml/builtin'
import { Stream } from '@yeger/streams'
import { graphStratify, sugiyama } from 'd3-dag'
import { useMemo } from 'react'
import type { Edge, Node } from 'reactflow'

export interface SizeConfig {
  width: number
  height: number
  horizontalSpacing: number
  verticalSpacing: number
}

const DEFAULT_SIZE_CONFIG: SizeConfig = {
  width: 120,
  height: 60,
  horizontalSpacing: 80,
  verticalSpacing: 80,
}

export function useFlowGraph(tree: TreeModel) {
  return useMemo(() => {
    const nodes = createNodes(tree)
    const hierarchy = createHierarchy(nodes)
    return createFlowGraph(hierarchy, DEFAULT_SIZE_CONFIG)
  }, [tree])
}

export type FlowNode = TreeNode & { id: string, parent?: FlowNode, value?: string, children: FlowNode[] }

export type FlowGraphModel = ReturnType<typeof useFlowGraph>

function createNodes(tree: TreeModel) {
  const nodes: FlowNode[] = []

  function convertNode(node: TreeNode, index: number, parent?: FlowNode) {
    const id = `${parent ? `${parent.id}.` : ''}${index}`
    const flowNode: FlowNode = { id, parent, value: node.value, children: [] }
    nodes.push(flowNode)
    const children = node.children
    if (!children) {
      return flowNode
    }
    for (const [index, child] of children.entries()) {
      const childNode = convertNode(child, index, flowNode)
      flowNode.children.push(childNode)
    }
    return flowNode
  }

  convertNode(tree.root, 0)
  return nodes
}

/**
 * Create a (tree) hierarchy layout from the given nodes.
 */
function createHierarchy(nodes: FlowNode[]) {
  const stratify = graphStratify()
  return stratify([
    ...nodes.map((node) => ({
      ...node,
      id: node.id,
      parentIds: node.parent ? [node.parent.id] : [],
    })),
  ])
}

function createFlowGraph(
  hierarchy: ReturnType<typeof createHierarchy>,
  sizeConfig: SizeConfig,
) {
  const { width, height, horizontalSpacing, verticalSpacing } = sizeConfig
  const layout = sugiyama().nodeSize([
    width + horizontalSpacing,
    height + verticalSpacing,
  ])
  const layoutResult = layout(hierarchy)
  const nodes = Stream.from(hierarchy.nodes())
    .map<Node<FlowNode>>(
      (node) =>
        ({
          id: node.data.id,
          data: {
            ...node.data,
            label: node.data.value ?? '',
          },
          position: { x: node.x, y: node.y },
        }) as const,
    )
    .toArray()
  const edges = Stream.from(nodes).flatMap<Edge<unknown>>((node) =>
    Stream
      .from(node.data.children ?? [])
      .map((child) => ({
        id: `edge-${node.id}-${child.id}`,
        source: node.id,
        target: child.id,
      }))).toArray()
  return { nodes, edges, sizeConfig, layoutResult }
}
