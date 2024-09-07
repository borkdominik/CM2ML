/// <reference lib="webworker" />

import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import { sugiyama, graphStratify as sugiyamaStratify } from 'd3-dag'
import { tree, stratify as treeStratify } from 'd3-hierarchy'
import { useMemo } from 'react'
import type { Edge, Node } from 'reactflow'

interface IRTreeSizeConfig {
  width: number
  height: number
  horizontalSpacing: number
  verticalSpacing: number
}

export interface IRFlowNode {
  id: string
  graphNode: GraphNode
  children: IRFlowNode[]
  color?: string
  isOrigin?: true
}

export interface IRFlowGraphModel {
  edges: Edge<unknown>[]
  nodes: Node<IRFlowNode>[]
  sizeConfig: IRTreeSizeConfig
  type: 'tree' | 'sugiyama'
}

const sugiyamaSizeConfig: IRTreeSizeConfig = {
  width: 120,
  height: 60,
  horizontalSpacing: 80,
  verticalSpacing: 80,
}

const treeSizeConfig: IRTreeSizeConfig = {
  width: 80,
  height: 50,
  horizontalSpacing: 20,
  verticalSpacing: 50,
}

export function useIRTree(model: GraphModel) {
  return useMemo(() => createFlowGraphFromModel(model), [model])
}

function createFlowGraphFromModel(model: GraphModel) {
  const nodes = createNodes(model)
  const hierarchy = createHierarchy(nodes)
  return createFlowGraph(hierarchy)
}

function createNodes(model: GraphModel) {
  const nodes: IRFlowNode[] = []

  function convertNode(node: GraphNode, isOrigin?: true): IRFlowNode {
    const id = node.id
    if (!id) {
      throw new Error('Node ID is undefined')
    }
    const flowNode: IRFlowNode = {
      id,
      children: Stream.from(node.children).map((child) => convertNode(child)).toArray(),
      graphNode: node,
      isOrigin,
    }
    nodes.push(flowNode)
    return flowNode
  }

  convertNode(model.root, true)
  return nodes
}

interface Hierarchy {
  nodes: Node<IRFlowNode>[]
  sizeConfig: IRTreeSizeConfig
  type: 'tree' | 'sugiyama'
}

function createHierarchy(nodes: IRFlowNode[]): Hierarchy {
  if (isLargeModel(nodes)) {
    return createTreeHierarchy(nodes, treeSizeConfig)
  }
  return createSugiyamaHierarchy(nodes, sugiyamaSizeConfig)
}

function isLargeModel(nodes: IRFlowNode[]) {
  return nodes.length > 750
}

/**
 * Create a (tree) hierarchy layout from the given nodes.
 */
function createTreeHierarchy(nodes: IRFlowNode[], sizeConfig: IRTreeSizeConfig) {
  const { width, height, horizontalSpacing, verticalSpacing } = sizeConfig
  const createHierarchy = treeStratify<IRFlowNode>()
    .parentId(({ graphNode }) => graphNode.parent?.id)
  const hierarchy = createHierarchy(nodes)
  const layout = tree<IRFlowNode>().nodeSize(
    [
      width + horizontalSpacing,
      height + verticalSpacing,
    ],
  )
  const layoutResult = layout(hierarchy)
  const mappedNodes = layoutResult
    .descendants()
    .map((node) => ({
      id: node.data.id,
      data: node.data,
      position: { x: node.x, y: node.y },
    }))
  return { nodes: mappedNodes, sizeConfig, type: 'tree' as const }
}

/**
 * Create a (sugiyama) hierarchy layout from the given nodes.
 */
function createSugiyamaHierarchy(nodes: IRFlowNode[], sizeConfig: IRTreeSizeConfig) {
  const { width, height, horizontalSpacing, verticalSpacing } = sizeConfig
  const createHierarchy = sugiyamaStratify()
    .parentIds(({ graphNode }: IRFlowNode) => graphNode.parent?.id ? [graphNode.parent.id] : [])
  const hierarchy = createHierarchy(nodes)
  const layout = sugiyama().nodeSize([
    width + horizontalSpacing,
    height + verticalSpacing,
  ])
  layout(hierarchy)
  const mappedNodes = Stream.from(hierarchy.nodes())
    .map<Node<IRFlowNode>>(
      (node) =>
        ({
          id: node.data.id,
          data: node.data,
          selectable: true,
          focusable: true,
          position: { x: node.x, y: node.y },
        }) as const,
    )
    .toArray()
  return { nodes: mappedNodes, sizeConfig, type: 'sugiyama' as const }
}

function createFlowGraph(
  hierarchy: Hierarchy,
) {
  const edges = Stream
    .from(hierarchy.nodes)
    .flatMap<Edge<unknown>>((node) =>
      Stream
        .from(node.data.children ?? [])
        .map((child) => ({
          id: `edge-${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
        })),
    )
    .toArray()
  return { ...hierarchy, edges }
}
