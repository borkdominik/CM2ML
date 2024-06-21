import type { AdjacencyMatrix } from '@cm2ml/builtin'
import type { PointerEvent } from 'react'
import { useMemo } from 'react'

import { colors } from '../../../../colors'
import { useIsSelectedEdge, useIsSelectedSource, useIsSelectedTarget, useSelection } from '../../../../lib/useSelection'
import { cn, createOpacityRangeMapper } from '../../../../lib/utils'

const cellSize = 25
const fontSize = cellSize / 2

export function useWeightedOpacityFromMatrix(matrix: AdjacencyMatrix) {
  return useMemo(() => {
    const weights = matrix.flat()
    const min = weights.reduce((min, weight) => Math.min(min, weight), Infinity)
    const max = weights.reduce((max, weight) => Math.max(max, weight), 0)
    return createOpacityRangeMapper(min, max)
  }, [matrix])
}

export interface GridProps {
  matrix: AdjacencyMatrix
  nodes: string[]
}

export function Grid({ matrix, nodes }: GridProps) {
  const size = cellSize * nodes.length
  const offset = useMemo(() => Math.min(...nodes.map(getLabelOffset)), [nodes])
  const viewBoxSize = size - offset
  const getOpacity = useWeightedOpacityFromMatrix(matrix)
  const clearSelection = useSelection.use.clearSelection()
  return (
    <svg
      height={size}
      width={size}
      viewBox={`${offset} ${offset} ${viewBoxSize} ${viewBoxSize}`}
      className="size-full"
      onPointerDown={() => clearSelection()}
    >
      <Labels nodes={nodes} offset={offset} />
      {nodes.map((node, row) => (
        <GridRow
          getOpacity={getOpacity}
          key={node}
          matrix={matrix}
          nodes={nodes}
          row={row}
        />
      ))}
    </svg>
  )
}

function getLabelOffset(nodeId: string) {
  return nodeId.length * -0.65 * fontSize
}

interface LabelsProps {
  nodes: string[]
  offset: number
}

function Labels({ nodes, offset }: LabelsProps) {
  return (
    <>
      <text
        height={cellSize}
        y={-fontSize / 2}
        x={offset}
        className="cursor-default select-none fill-foreground font-mono"
        fontSize={fontSize}
      >
        Source
      </text>
      <text
        height={cellSize}
        y={-fontSize / 2}
        x={-offset}
        className="-rotate-90 cursor-default select-none fill-foreground font-mono "
        fontSize={fontSize}
        textAnchor="end"
      >
        Target
      </text>
      {nodes.map((node, index) => (
        <Label index={index} key={node} node={node} offset={offset} />
      ))}
    </>
  )
}

interface LabelProps {
  index: number
  node: string
  offset: number
}

function Label({ index, node, offset }: LabelProps) {
  const isRowSelected = useIsSelectedSource(node)
  const isColumnSelected = useIsSelectedTarget(node)
  const setSelection = useSelection.use.setSelection()

  const onPointerDown = (event: PointerEvent<SVGTextElement>) => {
    event.stopPropagation()
    setSelection({ selection: node, origin: 'graph' })
  }

  return (
    <>
      <text
        height={cellSize}
        y={cellSize * (index + 1) - fontSize / 2}
        x={offset}
        className={cn({
          'cursor-default fill-foreground font-mono hover:fill-secondary-foreground hover:font-bold select-none':
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
          '-rotate-90 cursor-default font-mono hover:fill-secondary-foreground hover:font-bold select-none':
            true,
          'fill-foreground': !isColumnSelected,
          'fill-primary': isColumnSelected,
        })}
        fontSize={fontSize}
        onPointerDown={onPointerDown}
      >
        {node}
      </text>
    </>
  )
}

interface GridRowProps {
  getOpacity: (weight: number) => number
  matrix: AdjacencyMatrix
  nodes: string[]
  row: number
}

function GridRow({ getOpacity, matrix, nodes, row }: GridRowProps) {
  return nodes.map((_otherNode, column) => (
    <GridCell
      column={column}
      getOpacity={getOpacity}
      // eslint-disable-next-line react/no-array-index-key
      key={`${row}-${column}`}
      nodes={nodes}
      row={row}
      value={matrix[row]?.[column] ?? 0}
    />
  ))
}

interface GridCellProps {
  column: number
  getOpacity: (weight: number) => number
  nodes: string[]
  row: number
  value: number
}

function GridCell({ column, getOpacity, nodes, row, value }: GridCellProps) {
  const sourceId = nodes[row]
  const targetId = nodes[column]

  const isCellSelected = useIsSelectedEdge(sourceId, targetId)
  const setSelection = useSelection.use.setSelection()

  if (value <= 0 || !sourceId || !targetId) {
    return null
  }

  const color = getCellColor(isCellSelected)

  const onPointerDown = (event: PointerEvent<SVGRectElement>) => {
    event.stopPropagation()
    setSelection({ selection: [[sourceId, targetId]], origin: 'graph' })
  }

  return (
    <rect
      height={cellSize}
      width={cellSize}
      key={`${column}-${row}`}
      x={cellSize * column}
      y={cellSize * row}
      fill={color}
      className="stroke-border hover:fill-secondary-foreground"
      style={{
        opacity: getOpacity(value),
        willChange: 'opacity',
      }}
      onPointerDown={onPointerDown}
    />
  )
}

function getCellColor(isSelected: boolean) {
  if (isSelected) {
    return colors.selected
  }
  return colors.active
}
