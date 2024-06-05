import type { TreeModel, TreeNode } from '@cm2ml/builtin'
import { Stream } from '@yeger/streams'
import { stratify, tree } from 'd3-hierarchy'
import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 as colorScheme } from 'd3-scale-chromatic'
import { useMemo } from 'react'
import type { Edge } from 'reactflow'

export interface SizeConfig {
  width: number
  height: number
  horizontalSpacing: number
  verticalSpacing: number
}

const DEFAULT_SIZE_CONFIG: SizeConfig = {
  width: 80,
  height: 50,
  horizontalSpacing: 20,
  verticalSpacing: 50,
}

export function useFlowGraph(tree: TreeModel, vocabulary: string[]) {
  return useMemo(() => {
    const nodes = createNodes(tree, vocabulary)
    const hierarchy = createHierarchy(nodes, DEFAULT_SIZE_CONFIG)
    return createFlowGraph(hierarchy, DEFAULT_SIZE_CONFIG)
  }, [tree])
}

export type FlowNode = Omit<TreeNode, 'children'> & {
  id: string
  children: FlowNode[]
  color?: string
  parent?: FlowNode
}

export type FlowGraphModel = ReturnType<typeof useFlowGraph>

function createNodes(tree: TreeModel, staticVocabulary: string[]) {
  const nodes: FlowNode[] = []
  const getColor = scaleOrdinal(colorScheme).domain([...staticVocabulary, ...staticVocabulary.map((v) => `${v}__child`)])

  function makeColor(node: TreeNode, parent?: FlowNode) {
    if (node.isStaticNode) {
      return getColor(node.value)
    }
    if (!parent) {
      return undefined
    }
    if (parent.isStaticNode) {
      return getColor(`${parent.value}__child`)
    }
    return parent.color
  }

  function convertNode(node: TreeNode, index: number, parent?: FlowNode) {
    const id = `${parent ? `${parent.id}.` : ''}${index}`

    const flowNode: FlowNode = { id, children: [], color: makeColor(node, parent), isStaticNode: node.isStaticNode, parent, value: node.value }
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
function createHierarchy(nodes: FlowNode[], sizeConfig: SizeConfig) {
  const treeLayout = tree<FlowNode>()
  const hierarchy = stratify<FlowNode>()
    .id((node) => node.id)
    .parentId((node) => node.parent?.id)
  const rootNode = hierarchy(nodes)
  const layout = treeLayout.nodeSize(
    [
      sizeConfig.width + sizeConfig.horizontalSpacing,
      sizeConfig.height + sizeConfig.verticalSpacing,
    ],
  )(rootNode)
  return layout
    .descendants()
    .map((node) => ({
      id: node.data.id,
      data: node.data,
      position: { x: node.x, y: node.y },
    }))
}

function createFlowGraph(
  nodes: ReturnType<typeof createHierarchy>,
  sizeConfig: SizeConfig,
) {
  const edges = Stream
    .from(nodes)
    .flatMap<Edge<unknown>>((node) =>
      Stream
        .from(node.data.children ?? [])
        .map((child) => ({
          id: `edge-${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
        })),
    ).toArray()
  return { nodes, edges, sizeConfig }
}
