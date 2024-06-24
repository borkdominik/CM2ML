import { type Id2WordMapping, type NodeIdMapping, type RecursiveTreeNode, TreeEncoder, type TreeModel, type TreeNodeValue, type Word2IdMapping } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { useEffect } from 'react'
import ReactFlow, { Background, BackgroundVariant, Controls, Handle, MiniMap, Panel, Position, useReactFlow } from 'reactflow'

import 'reactflow/dist/style.css'

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
  return <FlowGraph tree={encoding.data} idWordMapping={encoding.metadata.id2WordMapping} staticVocabulary={encoding.metadata.vocabularies.staticVocabulary} vocabulary={encoding.metadata.vocabularies.vocabulary} />
}

const nodeTypes = {
  default: FlowTreeNode,
}

interface FlowGraphProps {
  tree: TreeModel<RecursiveTreeNode>
  idWordMapping: Id2WordMapping
  staticVocabulary: TreeNodeValue[]
  vocabulary: TreeNodeValue[]
}

function FlowGraph({ tree, idWordMapping, vocabulary, staticVocabulary }: FlowGraphProps) {
  const { flowGraph, reverseNodeIdMapping, word2IdMapping } = useFlowGraph(tree, idWordMapping, staticVocabulary)
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
        <ViewFitter flowGraph={flowGraph} reverseNodeIdMapping={reverseNodeIdMapping} word2IdMapping={word2IdMapping} />
        <Panel position="top-left" className="font-mono text-xs opacity-50">
          {tree.format}
        </Panel>
        <Panel position="top-right" className="flex flex-col items-end gap-1 font-mono text-xs opacity-50">
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

function useIsFlowNodeSelected(flowNode: FlowNode) {
  const { selection } = useSelection.use.selection() ?? {}
  if (!selection) {
    return false
  }
  if (!isNodeSelection(selection)) {
    return false
  }
  const mappedSelection = mapValueToWordId(selection, flowNode.reverseNodeIdMapping, flowNode.word2IdMapping)
  return flowNode.value === mappedSelection
}

function FlowTreeNode({ data }: { data: FlowNode }) {
  const isOrigin = data.parent === undefined
  const isTerminal = data.children.length === 0
  const setSelection = useSelection.use.setSelection()
  const isSelected = useIsFlowNodeSelected(data)
  const select = () => {
    const selection = mapWordIdToValue(data.value, data.nodeIdMapping, data.id2WordMapping)
    setSelection({ selection, origin: 'tree' })
  }
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
        onClick={select}
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
function ViewFitter({ flowGraph, reverseNodeIdMapping, word2IdMapping }: { flowGraph: FlowGraphModel, reverseNodeIdMapping: NodeIdMapping, word2IdMapping: Word2IdMapping }) {
  const reactFlow = useReactFlow<FlowNode>()

  useEffect(() => {
    const timeout = setTimeout(() => {
      reactFlow.fitView({ duration: 200 })
    }, 200)
    return () => clearTimeout(timeout)
  }, [reactFlow, flowGraph])

  const { origin, selection } = useSelection.use.selection() ?? {}
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (origin === 'tree') {
        return
      }
      if (!selection || !isNodeSelection(selection)) {
        return
      }
      const mappedSelection = mapValueToWordId(selection, reverseNodeIdMapping, word2IdMapping)
      const selectedNodes = reactFlow.getNodes().filter((node) => node.data.value === mappedSelection)
      const firstSelectedNode = selectedNodes.sort((a, b) => {
        if (a.position.y === b.position.y) {
          return a.position.x > b.position.x ? 1 : -1
        }
        return a.position.y > b.position.y ? 1 : -1
      })[0]
      if (!firstSelectedNode) {
        return
      }
      reactFlow.setCenter(firstSelectedNode.position.x, firstSelectedNode.position.y, { duration: 200, zoom: 1 })
    }, 200)
    return () => clearTimeout(timeout)
  }, [reactFlow, selection, reverseNodeIdMapping, word2IdMapping, origin])

  return null
}

function mapValueToWordId(value: string, reverseNodeIdMapping: NodeIdMapping, word2IdMapping: Word2IdMapping) {
  // 1. Map the original value to a reduced node id (if applicable)
  const mappedValue = reverseNodeIdMapping[value] ?? value
  // 2. Map the reduced node id to the word id
  const mappedWordId = word2IdMapping[mappedValue] ?? mappedValue
  return mappedWordId
}

function mapWordIdToValue(wordId: string | number, nodeIdMapping: NodeIdMapping, id2WordMapping: Id2WordMapping) {
  // 1. Map the word id to the word
  const mappedWord = typeof wordId === 'number' ? id2WordMapping[`${wordId}`] ?? wordId : wordId
  // 2. Map the reduced node id to the original value (if applicable)
  const mappedValue = nodeIdMapping[mappedWord] ?? mappedWord
  return `${mappedValue}`
}
