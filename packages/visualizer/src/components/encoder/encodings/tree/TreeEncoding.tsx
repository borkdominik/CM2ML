import { TreeEncoder, type TreeModel } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { useEffect } from 'react'
import ReactFlow, { Background, BackgroundVariant, Controls, Handle, MiniMap, Panel, Position, useReactFlow } from 'reactflow'

import 'reactflow/dist/style.css'

import type { ParameterValues } from '../../../Parameters'
import { Hint } from '../../../ui/hint'
import { useEncoder } from '../../useEncoder'

import { type FlowGraphModel, type FlowNode, useFlowGraph } from './useFlowGraph'

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

export function TreeEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(TreeEncoder, model, parameters)
  if (error || !encoding) {
    return <Hint error={error} />
  }
  return <FlowGraph tree={encoding.data} vocabulary={encoding.metadata.staticVocabulary} />
}

const nodeTypes = {
  default: FlowTreeNode,
}

interface FlowGraphProps {
  tree: TreeModel
  vocabulary: string[]
}

function FlowGraph({ tree, vocabulary }: FlowGraphProps) {
  const flowGraph = useFlowGraph(tree, vocabulary)
  const { nodes, edges, type } = flowGraph
  return (
    <div className="size-full">
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
        minZoom={0.05}
        maxZoom={1}
        onlyRenderVisibleElements
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} />
        <MiniMap zoomable />
        <ViewFitter flowGraph={flowGraph} />
        <Panel position="top-right" className="font-mono text-xs opacity-50">
          {type === 'sugiyama' ? '✨ ' : '🌲 '}
          {nodes.length}
          {' '}
          {nodes.length > 1 ? 'nodes' : 'node'}
        </Panel>
      </ReactFlow>
    </div>
  )
}

function FlowTreeNode({ data }: { data: FlowNode }) {
  const isOrigin = data.parent === undefined
  const isTerminal = data.children.length === 0
  return (
    <div>
      {isOrigin
        ? null
        : (
          <Handle type="target" position={Position.Top} isConnectable={false} />
          )}
      <div
        className="break-words rounded-sm px-2 py-1 font-mono"
        style={{
          outlineStyle: 'solid',
          outlineColor: data.color,
          outlineWidth: 2,
        }}
      >
        {data.value}
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
function ViewFitter({ flowGraph }: { flowGraph: FlowGraphModel }) {
  const reactFlow = useReactFlow()
  useEffect(() => {
    setTimeout(() => {
      reactFlow.fitView({ duration: 200 })
    }, 200)
  }, [reactFlow, flowGraph])
  return null
}
