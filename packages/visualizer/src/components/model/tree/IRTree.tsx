import type { GraphModel } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import { useEffect, useMemo } from 'react'
import ReactFlow, { Background, BackgroundVariant, Controls, Handle, MiniMap, Panel, Position, useReactFlow } from 'reactflow'

import { useSelection } from '../../../lib/useSelection'
import { cn } from '../../../lib/utils'

import type { IRFlowGraphModel, IRFlowNode } from './useIRTree'
import { useIRTree } from './useIRTree'

export interface Props {
  model: GraphModel
}

const nodeTypes = {
  default: IRFlowTreeNode,
}

export function IRTree({ model }: Props) {
  const clearSelection = useSelection.use.clearSelection()
  const flowGraph = useIRTree(model)
  const { nodes, edges, type } = flowGraph
  return (
    <div className="size-full" data-testid="ir-tree">
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        edgesFocusable={false}
        edgesUpdatable={false}
        nodesConnectable={false}
        nodesDraggable={false}
        nodesFocusable={false}
        zoomOnDoubleClick={false}
        onPaneClick={clearSelection}
        minZoom={0.05}
        maxZoom={1}
        onlyRenderVisibleElements
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} />
        <MiniMap zoomable />
        <ViewFitter flowGraph={flowGraph} />
        <Panel position="top-right" className="flex cursor-default flex-col items-end gap-1 font-mono text-xs opacity-50">
          <span>
            {type === 'sugiyama' ? '✨ ' : '🌲 '}
            {nodes.length}
            {' '}
            {nodes.length > 1 ? 'nodes' : 'node'}
          </span>
        </Panel>
      </ReactFlow>
    </div>
  )
}

function useIsFlowNodeSelected(flowNode: IRFlowNode) {
  const selection = useSelection.use.selection()
  return useMemo(() => {
    if (!selection) {
      return false
    }
    if (selection.type === 'nodes') {
      return selection.nodes.includes(flowNode.id)
    }
    return selection.edges.some(([source, target]) => source === flowNode.id || target === flowNode.id)
  }, [flowNode, selection])
}

function IRFlowTreeNode({ data }: { data: IRFlowNode }) {
  const isOrigin = data.isOrigin ?? false
  const isTerminal = data.children.length === 0
  const setSelection = useSelection.use.setSelection()
  const isSelected = useIsFlowNodeSelected(data)
  const select = () => {
    setSelection({ type: 'nodes', nodes: [data.id], origin: 'ir-tree' })
  }
  return (
    <div data-testid={`ir-tree-node-${data.id.toString()}`} className={isSelected ? 'tree-node__selected' : ''}>
      {isOrigin
        ? null
        : (
            <Handle type="target" position={Position.Top} isConnectable={false} />
          )}
      <div
        className={cn({ 'break-words rounded-sm px-4 py-2 font-mono outline': true, 'outline-primary': isSelected, 'outline-secondary': !isSelected })}
        style={{
          outlineWidth: isSelected ? 6 : 2,
        }}
        onClick={select}
      >
        {data.graphNode.tag}
      </div>
      {isTerminal
        ? null
        : (
            <Handle
              type="source"
              position={Position.Bottom}
              isConnectable={false}
            />
          )}
    </div>
  )
}

/**
 * Utility component that (re-)fits the view of the ReactFlow component should the input model change.
 * It needs to be a child of the {@link ReactFlow} component and not a hook, because it needs access to the react flow instance via {@link useReactFlow}.
 */
function ViewFitter({ flowGraph }: { flowGraph: IRFlowGraphModel }) {
  const reactFlow = useReactFlow<IRFlowNode>()

  useEffect(() => {
    const timeout = setTimeout(() => {
      reactFlow.fitView({ duration: 200 })
    }, 200)
    return () => clearTimeout(timeout)
  }, [reactFlow, flowGraph])

  const selection = useSelection.use.selection()
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!selection) {
        return
      }
      if (selection?.origin === 'ir-tree') {
        return
      }
      if (selection.type === 'nodes') {
        reactFlow.fitView({ nodes: selection.nodes.map((id) => ({ id })), duration: 200 })
      }
      if (selection.type === 'edges') {
        reactFlow.fitView({ nodes: Stream.from(selection.edges).flatMap(([source, target]) => [source, target]).distinct().map((id) => ({ id })).toArray(), duration: 200 })
      }
    }, 200)
    return () => clearTimeout(timeout)
  }, [reactFlow, selection])

  return null
}
