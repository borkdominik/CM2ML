import type { TreeModel } from '@cm2ml/builtin'
import { TreeEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { useEffect } from 'react'
import ReactFlow, { Background, BackgroundVariant, Controls, Handle, MiniMap, Position, useReactFlow } from 'reactflow'

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
  return <FlowGraph encoding={encoding} />
}

const nodeTypes = {
  default: FlowTreeNode,
}

function FlowGraph({ encoding }: { encoding: TreeModel }) {
  const flowGraph = useFlowGraph(encoding)
  const { nodes, edges } = flowGraph
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
      </ReactFlow>
    </div>
  )
}

function FlowTreeNode({ data }: { data: FlowNode }) {
  const isOrigin = data.parent === undefined
  const isTerminal = data.children.length === 0
  return (
    <div className="flex flex-col">
      {isOrigin
        ? null
        : (
          <Handle type="target" position={Position.Top} isConnectable={false} />
          )}
      <div
        className="flex flex-col break-words rounded p-4"
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
