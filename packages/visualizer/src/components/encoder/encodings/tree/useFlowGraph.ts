import type { Id2WordMapping, NodeIdMapping, RecursiveTreeNode, TreeModel, TreeNodeValue } from '@cm2ml/builtin'
import { Stream } from '@yeger/streams'
import { sugiyama, graphStratify as sugiyamaStratify } from 'd3-dag'
import { tree, stratify as treeStratify } from 'd3-hierarchy'
import { scaleOrdinal } from 'd3-scale'
import { schemeCategory10 as colorScheme } from 'd3-scale-chromatic'
import { useMemo } from 'react'
import type { Edge, Node } from 'reactflow'

export interface SizeConfig {
  width: number
  height: number
  horizontalSpacing: number
  verticalSpacing: number
}

const sugiyamaSizeConfig: SizeConfig = {
  width: 120,
  height: 60,
  horizontalSpacing: 80,
  verticalSpacing: 80,
}

const treeSizeConfig: SizeConfig = {
  width: 80,
  height: 50,
  horizontalSpacing: 20,
  verticalSpacing: 50,
}

export function useFlowGraph(tree: TreeModel<RecursiveTreeNode>, idWordMapping: Id2WordMapping, staticVocabulary: TreeNodeValue[]) {
  return useMemo(() => {
    const word2IdMapping: Record<TreeNodeValue, number> = {}
    idWordMapping.forEach((word, id) => {
      word2IdMapping[word] = id
    })
    const nodes = createNodes(tree, idWordMapping, staticVocabulary)
    const hierarchy = createHierarchy(nodes)
    return createFlowGraph(hierarchy)
  }, [tree])
}

export type FlowNode = Omit<RecursiveTreeNode, 'children'> & {
  id: string
  children: FlowNode[]
  color?: string
  parent?: FlowNode
  nodeIdMapping: NodeIdMapping
  idWordMapping: Id2WordMapping
}

export type FlowGraphModel = ReturnType<typeof useFlowGraph>

function createNodes(tree: TreeModel<RecursiveTreeNode>, idWordMapping: Id2WordMapping, staticVocabulary: TreeNodeValue[]) {
  const nodes: FlowNode[] = []
  const getColor = scaleOrdinal(colorScheme).domain([...staticVocabulary.map((v) => `${v}`), ...staticVocabulary.map((v) => `${v}__child`)])

  function makeColor(node: RecursiveTreeNode, parent?: FlowNode) {
    if (node.isStaticNode) {
      return getColor(`${node.value}`)
    }
    if (!parent) {
      return undefined
    }
    if (parent.isStaticNode) {
      return getColor(`${parent.value}__child`)
    }
    return parent.color
  }

  function convertNode(node: RecursiveTreeNode, index: number, parent?: FlowNode) {
    const id = `${parent ? `${parent.id}.` : ''}${index}`

    const flowNode: FlowNode = { id, children: [], color: makeColor(node, parent), nodeIdMapping: tree.nodeIdMapping, idWordMapping, isStaticNode: node.isStaticNode, parent, value: node.value }
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

export interface Hierarchy {
  nodes: Node<FlowNode>[]
  sizeConfig: SizeConfig
  type: 'tree' | 'sugiyama'
}

function createHierarchy(nodes: FlowNode[]): Hierarchy {
  if (isLargeModel(nodes)) {
    return createTreeHierarchy(nodes, treeSizeConfig)
  }
  return createSugiyamaHierarchy(nodes, sugiyamaSizeConfig)
}

function isLargeModel(nodes: FlowNode[]) {
  return nodes.length > 750
}

/**
 * Create a (tree) hierarchy layout from the given nodes.
 */
function createTreeHierarchy(nodes: FlowNode[], sizeConfig: SizeConfig) {
  const { width, height, horizontalSpacing, verticalSpacing } = sizeConfig
  const createHierarchy = treeStratify<FlowNode>()
    .parentId((node) => node.parent?.id)
  const hierarchy = createHierarchy(nodes)
  const layout = tree<FlowNode>().nodeSize(
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
function createSugiyamaHierarchy(nodes: FlowNode[], sizeConfig: SizeConfig) {
  const { width, height, horizontalSpacing, verticalSpacing } = sizeConfig
  const createHierarchy = sugiyamaStratify()
    .parentIds((node: FlowNode) => node.parent ? [node.parent.id] : [])
  const hierarchy = createHierarchy(nodes)
  const layout = sugiyama().nodeSize([
    width + horizontalSpacing,
    height + verticalSpacing,
  ])
  layout(hierarchy)
  const mappedNodes = Stream.from(hierarchy.nodes())
    .map<Node<FlowNode>>(
      (node) =>
        ({
          id: node.data.id,
          data: node.data,
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
    ).toArray()
  return { ...hierarchy, edges }
}
