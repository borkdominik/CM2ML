import type { Id2WordMapping, NodeIdMapping, RecursiveTreeNode, TreeFormat, TreeModel, TreeNodeValue, Word2IdMapping } from '@cm2ml/builtin'
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
    const { nodes, reverseNodeIdMapping, word2IdMapping } = createNodes(tree, idWordMapping, staticVocabulary)
    const hierarchy = createHierarchy(nodes)
    const flowGraph = createFlowGraph(hierarchy)
    return { flowGraph, reverseNodeIdMapping, word2IdMapping }
  }, [tree])
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
  /**
   * Indicates that the node represents the id of a model element.
   * If {@link FlowNode.isEdgeSource} or {@link FlowNode.isEdgeTarget} are set, {@link FlowNode.isNodeId} must be false.
   */
  isNodeId: boolean
  /**
   * Indicates that the node explicitly represents the source of an edge between two model elements.
   * If not false, the value is the target of the edge.
   * If {@link FlowNode.isNodeId} or {@link FlowNode.isEdgeTarget} are set, {@link FlowNode.isEdgeSource} must be false.
   */
  isEdgeSource: false | TreeNodeValue
  /**
   * Indicates that the node explicitly represents the target of an edge between two model elements.
   * If not false, the value is the source of the edge.
   * If {@link FlowNode.isNodeId} or {@link FlowNode.isEdgeSource} are set, {@link FlowNode.isEdgeTarget} must be false.
   */
  isEdgeTarget: false | TreeNodeValue
  /**
   * The format of the tree.
   * This property may used for format-dependent behavior.
   */
  treeFormat: TreeFormat
}

export type FlowGraphModel = ReturnType<typeof useFlowGraph>['flowGraph']

function createNodes(tree: TreeModel<RecursiveTreeNode>, id2WordMapping: Id2WordMapping, staticVocabulary: TreeNodeValue[]) {
  const nodes: FlowNode[] = []
  const getColor = scaleOrdinal(colorScheme).domain([...staticVocabulary.map((v) => `${v}`), ...staticVocabulary.map((v) => `${v}__child`)])

  const reverseNodeIdMapping = (function () {
    const reversedMapping: NodeIdMapping = {}
    Object.entries(tree.nodeIdMapping).forEach(([newNodeId, originalId]) => {
      reversedMapping[originalId] = newNodeId
    })
    return reversedMapping
  }())

  const word2IdMapping = (function () {
    const reversedMapping: Word2IdMapping = {}
    Object.entries(id2WordMapping).forEach(([id, word]) => {
      reversedMapping[word] = +id
    })
    return reversedMapping
  }())

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

  function convertNode(node: RecursiveTreeNode, index: number, parent?: FlowNode, rawParent?: RecursiveTreeNode, rawGrandParent?: RecursiveTreeNode): FlowNode {
    const id = `${parent ? `${parent.id}.` : ''}${index}`
    const flowNode: FlowNode = {
      id,
      children: [],
      color: makeColor(node, parent),
      nodeIdMapping: tree.nodeIdMapping,
      reverseNodeIdMapping,
      id2WordMapping,
      word2IdMapping,
      isStaticNode: node.isStaticNode,
      parent,
      value: node.value,
      treeFormat: tree.format,
      isNodeId: isNodeId(node.value, parent, tree.format),
      isEdgeSource: isEdgeSource(index, parent, tree.format, rawParent),
      isEdgeTarget: isEdgeTarget(index, parent, tree.format, rawParent, rawGrandParent),
    }
    nodes.push(flowNode)
    const children = node.children
    if (!children) {
      return flowNode
    }
    for (const [index, child] of children.entries()) {
      const childNode = convertNode(child, index, flowNode, node, rawParent)
      flowNode.children.push(childNode)
    }
    return flowNode
  }

  convertNode(tree.root, 0)
  return { nodes, reverseNodeIdMapping, word2IdMapping }
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

function isNodeId(value: TreeNodeValue, parent: FlowNode | undefined, format: TreeFormat) {
  if (!parent) {
    return false
  }
  if (format === 'global') {
    return parent.value === 'OBJ'
      && parent.parent?.value === 'MODEL'
      && parent.parent.parent === undefined
      && value !== 'ATTS' // is not the ATTS node at the same level as the id node
  }
  if (format === 'local') {
    return parent.value === 'NAME'
      && parent.parent?.value === 'CLS'
      && parent.parent.parent?.value === 'MODEL'
      && parent.parent.parent.parent === undefined
  }
  if (format === 'compact') {
    return parent.value === 'MODEL' && parent.parent === undefined
  }
  return false
}

function isEdgeSource(index: number, parent: FlowNode | undefined, format: TreeFormat, rawParent: RecursiveTreeNode | undefined): TreeNodeValue | false {
  if (!parent) {
    return false
  }
  if (format === 'global') {
    if (!(parent.value === 'ASSOC'
      && parent.parent?.value === 'MODEL'
      && parent.parent.parent === undefined
      && index === 1)) {
      return false
    }
    const explicitTarget = rawParent?.children[2]?.value
    if (explicitTarget === undefined) {
      throw new Error('Invalid edge source state. This is an internal error.')
    }
    return explicitTarget
  }
  if (format === 'local') {
    // local format has the current CLS context as implicit edge source
    return false
  }
  if (format === 'compact') {
    // local format has the current context as implicit edge source
    return false
  }
  return false
}

function isEdgeTarget(index: number, parent: FlowNode | undefined, format: TreeFormat, rawParent: RecursiveTreeNode | undefined, rawGrandParent: RecursiveTreeNode | undefined): TreeNodeValue | false {
  if (!parent) {
    return false
  }
  if (format === 'global') {
    if (!(parent.value === 'ASSOC'
      && parent.parent?.value === 'MODEL'
      && parent.parent.parent === undefined
      && index === 2)) {
      return false
    }
    const explicitSource = rawParent?.children[1]?.value
    if (explicitSource === undefined) {
      throw new Error('Invalid edge target state. This is an internal error.')
    }
    return explicitSource
  }
  if (format === 'local') {
    if (!(parent.value === 'ASSOCS'
      && parent.parent?.value === 'CLS'
      && parent.parent.parent?.value === 'MODEL'
      && parent.parent.parent.parent === undefined)) {
      return false
    }
    const implicitSource = rawGrandParent?.children[0]?.children[0]?.value
    if (implicitSource === undefined) {
      throw new Error('Invalid edge target state. This is an internal error.')
    }
    return implicitSource
  }
  if (format === 'compact') {
    if (!(parent.value === 'ASSOCS'
      && parent.parent?.parent?.value === 'MODEL'
      && parent.parent.parent.parent === undefined)) {
      return false
    }
    return parent.parent.value
  }
  return false
}
