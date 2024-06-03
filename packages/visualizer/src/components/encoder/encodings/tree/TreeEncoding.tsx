import type { TreeModel, TreeNode } from '@cm2ml/builtin'
import { TreeEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import { graphStratify, sugiyama } from 'd3-dag'
import { useEffect, useMemo } from 'react'
import ReactFlow, { Background, BackgroundVariant, Controls, MiniMap, useReactFlow } from 'reactflow'
import type { Edge, Node } from 'reactflow'

import 'reactflow/dist/style.css'

import type { ParameterValues } from '../../../Parameters'
import { Hint } from '../../../ui/hint'
import { useEncoder } from '../../useEncoder'

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

export function TreeEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(TreeEncoder, model, parameters)
  if (error || !encoding) {
    return <Hint error={error} />
  }
  return <FlowGraph encoding={encoding} />
}

function FlowGraph({ encoding }: { encoding: TreeModel }) {
  const { nodes, edges } = useFlowGraph(encoding)
  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgesFocusable={false}
        edgesUpdatable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnDoubleClick={false}
        onlyRenderVisibleElements
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} />
        <MiniMap />
        <ViewFitter />
      </ReactFlow>
    </div>
  )
}

type FlowNode = TreeNode & { id: string, parent?: FlowNode, value?: string, children: FlowNode[] }

function useFlowGraph(tree: TreeModel) {
  return useMemo(() => {
    const nodes = createNodes(tree)
    const hierarchy = createHierarchy(nodes)
    return createFlowGraph(hierarchy, { width: 100, height: 100, horizontalSpacing: 100, verticalSpacing: 100 })
  }, [tree])
}

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

export interface SizeConfig {
  width: number
  height: number
  horizontalSpacing: number
  verticalSpacing: number
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

// TODO: Add nodes as prop
function ViewFitter() {
  const nodes = 'TODO'
  const reactFlow = useReactFlow()
  useEffect(() => {
    setTimeout(() => {
      reactFlow.fitView({ duration: 200 })
    }, 200)
  }, [reactFlow, nodes])
  return null
}
