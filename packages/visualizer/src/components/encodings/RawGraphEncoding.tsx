import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { useMemo } from 'react'

import { colors } from '../../colors'
import { useSelection } from '../../selection'

const cellSize = 25
const fontSize = cellSize / 2

export interface Props {
  model: GraphModel
}

export function RawGraphEncoding({ model }: Props) {
  const encoding = useRawGraphEncoding(model)
  return (
    <div className="p-4">
      <Grid
        connections={encoding.connections}
        model={model}
        nodes={encoding.nodes}
      />
    </div>
  )
}

type Connections = Record<number, Set<number>>

interface GridProps {
  connections: Connections
  model: GraphModel
  nodes: string[]
}

function getOffset(nodeId: string) {
  return nodeId.length * -0.65 * fontSize
}

function Grid({ connections: connectedNodes, model, nodes }: GridProps) {
  const size = cellSize * nodes.length
  const offset = Math.min(...nodes.map(getOffset))
  return (
    <svg
      height={size}
      width={size}
      viewBox={`${offset} 0 ${size} ${size}`}
      className="h-full w-full"
    >
      {nodes.map((node, row) => (
        <GridRow
          connections={connectedNodes}
          key={node}
          model={model}
          node={node}
          nodes={nodes}
          row={row}
        />
      ))}
    </svg>
  )
}

interface GridRowProps {
  connections: Connections
  model: GraphModel
  node: string
  nodes: string[]
  row: number
}

function GridRow({ connections, model, node, nodes, row }: GridRowProps) {
  return (
    <>
      {/* TODO */}
      <text
        height={cellSize}
        y={cellSize * (row + 1) - fontSize / 2}
        x={getOffset(node)}
        className="font-mono"
        fontSize={fontSize}
      >
        {node}
      </text>
      {nodes.map((_otherNode, column) => (
        <GridCell
          column={column}
          isActive={connections[row]?.has(column) ?? false}
          key={`${row}-${column}`}
          model={model}
          nodes={nodes}
          row={row}
        />
      ))}
    </>
  )
}

interface GridCellProps {
  column: number
  isActive: boolean
  model: GraphModel
  nodes: string[]
  row: number
}

function GridCell({ column, isActive, nodes, row }: GridCellProps) {
  const sourceId = nodes[row]!
  const targetId = nodes[column]!
  const { clearSelection, selectedNodes, selectIds } = useSelection()
  const isSelected =
    selectedNodes.has(sourceId) &&
    selectedNodes.has(targetId) &&
    (sourceId !== targetId || selectedNodes.size === 1)
  const color = useCellColor(isActive, isSelected)
  function onEnter() {
    if (isActive) {
      selectIds([sourceId, targetId])
    } else {
      clearSelection()
    }
  }
  return (
    <rect
      height={cellSize}
      width={cellSize}
      key={`${column}-${row}`}
      x={cellSize * column}
      y={cellSize * row}
      fill={color}
      stroke="darkgrey"
      onPointerEnter={onEnter}
      onPointerLeave={clearSelection}
    />
  )
}

function useCellColor(isActive: boolean, isSelected: boolean) {
  if (isSelected && isActive) {
    return colors.selected
  }
  if (isActive) {
    return colors.active
  }
  return 'none'
}

function useRawGraphEncoding(model: GraphModel) {
  const encoding = useMemo(
    () =>
      GraphEncoder.invoke(model, {
        includeEqualPaths: false,
        sparse: true,
        weighted: false,
      }),
    [model],
  )
  const connections: Connections = {}
  if (!('list' in encoding)) {
    throw new Error('Expected encoding to be a list')
  }
  encoding.list.forEach((connection) => {
    const [source, target] = connection
    const set = connections[source] ?? new Set()
    set.add(target)
    connections[source] = set
  })
  return { connections, ...encoding }
}
