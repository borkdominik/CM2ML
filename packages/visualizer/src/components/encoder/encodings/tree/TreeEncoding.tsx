import { type RecursiveTreeNode, TreeEncoder, type TreeModel } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { useEffect } from 'react'
import ReactFlow, { Background, BackgroundVariant, Controls, Handle, MiniMap, Panel, Position, useReactFlow } from 'reactflow'

import 'reactflow/dist/style.css'

import type { EdgeSelection, NodeSelection } from '../../../../lib/useSelection'
import { isNodeSelection, useSelection } from '../../../../lib/useSelection'
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
  return <FlowGraph tree={encoding.data} staticVocabulary={encoding.metadata.vocabularies.staticVocabulary} vocabulary={encoding.metadata.vocabularies.vocabulary} />
}

const nodeTypes = {
  default: FlowTreeNode,
}

interface FlowGraphProps {
  tree: TreeModel<RecursiveTreeNode>
  staticVocabulary: string[]
  vocabulary: string[]
}

function FlowGraph({ tree, vocabulary, staticVocabulary }: FlowGraphProps) {
  const flowGraph = useFlowGraph(tree, staticVocabulary)
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
        <Panel position="top-left" className="font-mono text-xs opacity-50">
          {tree.format}
        </Panel>
        <Panel position="top-right" className="font-mono text-xs opacity-50 flex flex-col items-end gap-1">
          <span>
            {type === 'sugiyama' ? '✨ ' : '🌲 '}
            {nodes.length}
            {' '}
            {nodes.length > 1 ? 'nodes' : 'node'}
          </span>
          <span>
            {vocabulary.length}
            {' '}
            {vocabulary.length > 1 ? 'words' : 'word'}
          </span>
        </Panel>
      </ReactFlow>
    </div>
  )
}

function isFlowNodeSelected(flowNode: FlowNode, selection: NodeSelection | EdgeSelection | undefined) {
  if (!selection) {
    return false
  }
  if (isNodeSelection(selection)) {
    return selection === flowNode.value
  }
}

function FlowTreeNode({ data }: { data: FlowNode }) {
  const isOrigin = data.parent === undefined
  const isTerminal = data.children.length === 0
  const selection = useSelection.use.selection()
  const setSelection = useSelection.use.setSelection()
  const isSelected = isFlowNodeSelected(data, selection?.selection)
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
          outlineWidth: isSelected ? 6 : 2,
        }}
        onClick={() => setSelection({ selection: data.value, origin: 'tree' })}
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
  const { origin: source, selection } = useSelection.use.selection() ?? {}
  const reactFlow = useReactFlow<FlowNode>()
  useEffect(() => {
    setTimeout(() => {
      const selectedNodeId = selection && isNodeSelection(selection) ? selection : undefined
      const selectedNodes = selectedNodeId ? reactFlow.getNodes().filter((node) => node.data.value === selectedNodeId) : []
      const firstSelectedNode = selectedNodes.sort((a, b) => {
        if (a.position.y === b.position.y) {
          return a.position.x > b.position.x ? 1 : -1
        }
        return a.position.y > b.position.y ? 1 : -1
      })[0]
      if (firstSelectedNode) {
        if (source === 'tree') {
          return
        }
        reactFlow.setCenter(firstSelectedNode.position.x, firstSelectedNode.position.y, { duration: 200, zoom: 1 })
        return
      }
      reactFlow.fitView({ duration: 200 })
    }, 200)
  }, [reactFlow, flowGraph, selection])
  return null
}
