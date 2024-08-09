import { type Id2WordMapping, type NodeIdMapping, type RecursiveTreeNode, TreeEncoder, type TreeModel, type TreeNodeValue, type Word2IdMapping } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { useEffect, useMemo } from 'react'
import ReactFlow, { Background, BackgroundVariant, Controls, Handle, MiniMap, Panel, Position, useReactFlow } from 'reactflow'

import 'reactflow/dist/style.css'

import type { TreeFlowGraphModel } from '../../../../lib/treeUtils'
import { useSelection } from '../../../../lib/useSelection'
import type { ParameterValues } from '../../../Parameters'
import { Hint } from '../../../ui/hint'
import { useEncoder } from '../../useEncoder'

import type { TreeEncodingFlowNode } from './treeEncodingTreeTypes'
import { useTreeEncodingTree } from './useTreeEncodingTree'

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

export function TreeEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(TreeEncoder, model, parameters)
  if (error || !encoding) {
    return <Hint error={error} />
  }
  return <TreeEncodingFlowGraph tree={encoding.data} idWordMapping={encoding.metadata.id2WordMapping} staticVocabulary={encoding.metadata.vocabularies.staticVocabulary} vocabulary={encoding.metadata.vocabularies.vocabulary} />
}

const nodeTypes = {
  default: TreeEncodingFlowTreeNode,
}

interface FlowGraphProps {
  tree: TreeModel<RecursiveTreeNode>
  idWordMapping: Id2WordMapping
  staticVocabulary: TreeNodeValue[]
  vocabulary: TreeNodeValue[]
}

const fallbackFlowGraph: TreeFlowGraphModel<TreeEncodingFlowNode> = { nodes: [], edges: [], type: 'tree', sizeConfig: { width: 0, height: 0, horizontalSpacing: 0, verticalSpacing: 0 } }
const fallbackTreeGraph = { flowGraph: fallbackFlowGraph, reverseNodeIdMapping: {}, word2IdMapping: {} }

function TreeEncodingFlowGraph({ tree, idWordMapping, vocabulary, staticVocabulary }: FlowGraphProps) {
  const clearSelection = useSelection.use.clearSelection()
  const { data } = useTreeEncodingTree(tree, idWordMapping, staticVocabulary)
  const { flowGraph, reverseNodeIdMapping, word2IdMapping } = data ?? fallbackTreeGraph
  const { nodes, edges, type } = flowGraph
  return (
    <div className="size-full" data-testid="tree-graph">
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

function useIsTreeEncodingFlowNodeSelected(flowNode: TreeEncodingFlowNode) {
  const selection = useSelection.use.selection()
  return useMemo(() => {
    const flowNodeSelection = flowNode.selection
    if (!selection || flowNodeSelection === undefined) {
      return false
    }
    if (selection.type === 'nodes' && typeof flowNodeSelection === 'string') {
      return selection.nodes.some((selectedNode) =>
        mapValueToWordId(selectedNode, flowNode.reverseNodeIdMapping, flowNode.word2IdMapping) === flowNode.selection,
      )
    } else if (selection.type === 'edges' && Array.isArray(flowNodeSelection)) {
      return selection.edges.some(([source, target]) => {
        const mappedSource = mapValueToWordId(source, flowNode.reverseNodeIdMapping, flowNode.word2IdMapping)
        const mappedTarget = mapValueToWordId(target, flowNode.reverseNodeIdMapping, flowNode.word2IdMapping)
        return (mappedSource === flowNodeSelection[0] && mappedTarget === flowNodeSelection[1])
      })
    }
    return false
  }, [flowNode, selection])
}

function TreeEncodingFlowTreeNode({ data }: { data: TreeEncodingFlowNode }) {
  const isOrigin = data.parent === undefined
  const isTerminal = data.children.length === 0
  const setSelection = useSelection.use.setSelection()
  const isSelected = useIsTreeEncodingFlowNodeSelected(data)
  const select = () => {
    const flowNodeSelection = data.selection
    if (flowNodeSelection === undefined) {
      return
    }
    const selection = mapWordIdToValue(data.value, data.nodeIdMapping, data.id2WordMapping)
    if (typeof flowNodeSelection === 'string') {
      setSelection({ type: 'nodes', nodes: [selection], origin: 'tree-encoding' })
    } else if (Array.isArray(flowNodeSelection)) {
      const mappedSource = mapWordIdToValue(flowNodeSelection[0], data.nodeIdMapping, data.id2WordMapping)
      const mappedTarget = mapWordIdToValue(flowNodeSelection[1], data.nodeIdMapping, data.id2WordMapping)
      setSelection({ type: 'edges', edges: [[mappedSource, mappedTarget]], origin: 'tree-encoding' })
    }
  }
  const testid = data.selection ?? data.id
  return (
    <div data-testid={`tree-node-${testid.toString()}`} className={isSelected ? 'tree-node__selected' : ''}>
      {isOrigin
        ? null
        : (
            <Handle type="target" position={Position.Top} isConnectable={false} />
          )}
      <div
        className="break-words rounded-sm px-4 py-2 font-mono"
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
function ViewFitter({ flowGraph, reverseNodeIdMapping, word2IdMapping }: { flowGraph: TreeFlowGraphModel<TreeEncodingFlowNode>, reverseNodeIdMapping: NodeIdMapping, word2IdMapping: Word2IdMapping }) {
  const reactFlow = useReactFlow<TreeEncodingFlowNode>()

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
      if (selection?.origin === 'tree-encoding') {
        return
      }
      if (selection.type === 'nodes') {
        const mappedSelection = selection.nodes
          .map((selectedNode) => mapValueToWordId(selectedNode, reverseNodeIdMapping, word2IdMapping))
        const selectedNodes = reactFlow.getNodes()
          .filter((node) => typeof node.data.selection === 'string' && mappedSelection.includes(node.data.value))
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
      }
      if (selection.type === 'edges') {
        const mappedSelection = selection.edges
          .map(([source, target]) => [
            mapValueToWordId(source, reverseNodeIdMapping, word2IdMapping),
            mapValueToWordId(target, reverseNodeIdMapping, word2IdMapping),
          ] as const)
        const selectedNodes = reactFlow.getNodes()
          .filter((node) => {
            const flowNodeSelection = node.data.selection
            if (!Array.isArray(flowNodeSelection)) {
              return false
            }
            return mappedSelection.some(([source, target]) => source === flowNodeSelection[0] && target === flowNodeSelection[1])
          })
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
      }
    }, 200)
    return () => clearTimeout(timeout)
  }, [reactFlow, selection, reverseNodeIdMapping, word2IdMapping])

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
