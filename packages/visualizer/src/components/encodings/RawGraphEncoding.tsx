import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { useMemo } from 'react'

import { colors } from '../../colors'
import { useSelection } from '../../lib/useSelection'
import { cn } from '../../lib/utils'
import type { ParameterValues } from '../Parameters'

const cellSize = 25
const fontSize = cellSize / 2

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

// TODO: Handle encoding without edges
export function RawGraphEncoding({ model, parameters }: Props) {
  const encoding = useRawGraphEncoding(model, parameters)
  return (
    <div className="p-2">
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
  const viewBoxSize = size - offset
  return (
    <svg
      height={size}
      width={size}
      viewBox={`${offset} ${offset} ${viewBoxSize} ${viewBoxSize}`}
      className="h-full w-full"
    >
      <Labels nodes={nodes} offset={offset} />
      <g>
        {nodes.map((node, row) => (
          <GridRow
            connections={connectedNodes}
            key={node}
            model={model}
            nodes={nodes}
            row={row}
          />
        ))}
      </g>
    </svg>
  )
}
interface LabelsProps {
  nodes: string[]
  offset: number
}

function Labels({ nodes, offset }: LabelsProps) {
  return (
    <g>
      {nodes.map((node, index) => (
        <Label index={index} key={node} node={node} offset={offset} />
      ))}
    </g>
  )
}

interface LabelProps {
  index: number
  node: string
  offset: number
}

function Label({ index, node, offset }: LabelProps) {
  const { isSelectedSource, isSelectedTarget, setSelection } = useSelection()
  function onPointerDown() {
    setSelection(node)
  }
  const isRowSelected = isSelectedSource(node)
  const isColumnSelected = isSelectedTarget(node)
  return (
    <g>
      <text
        height={cellSize}
        y={cellSize * (index + 1) - fontSize / 2}
        x={offset}
        className={cn({
          'cursor-default fill-foreground font-mono hover:fill-secondary-foreground hover:font-bold':
            true,
          'fill-foreground': !isRowSelected,
          'fill-primary': isRowSelected,
        })}
        fontSize={fontSize}
        onPointerDown={onPointerDown}
      >
        {node}
      </text>
      <text
        height={cellSize}
        y={cellSize * (index + 1) - fontSize / 2}
        x={fontSize}
        className={cn({
          '-rotate-90 cursor-default font-mono hover:fill-secondary-foreground hover:font-bold':
            true,
          'fill-foreground': !isColumnSelected,
          'fill-primary': isColumnSelected,
        })}
        fontSize={fontSize}
        onPointerDown={onPointerDown}
      >
        {node}
      </text>
    </g>
  )
}

interface GridRowProps {
  connections: Connections
  model: GraphModel
  nodes: string[]
  row: number
}

function GridRow({ connections, model, nodes, row }: GridRowProps) {
  return (
    <g>
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
    </g>
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
  const sourceId = nodes[row]
  const targetId = nodes[column]
  const { isSelectedEdge, clearSelection, setSelection } = useSelection()
  const isCellSelected = isSelectedEdge(sourceId, targetId)
  const color = useCellColor(isActive, isCellSelected)
  function onPointerDown() {
    if (isActive && sourceId && targetId) {
      setSelection([[sourceId, targetId]])
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
      className={cn({
        'stroke-border': true,
        'hover:fill-secondary-foreground': isActive,
      })}
      onPointerDown={onPointerDown}
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

function useRawGraphEncoding(model: GraphModel, parameters: ParameterValues) {
  const encoding = useMemo(
    () => GraphEncoder.validateAndInvoke(model, parameters),
    [model],
  )
  const connections: Connections = {}
  if (!('list' in encoding)) {
    throw new Error('Expected encoding to be a list')
  }
  encoding.list.forEach(([source, target]) => {
    const set = connections[source] ?? new Set()
    set.add(target)
    connections[source] = set
  })
  return { connections, ...encoding }
}
