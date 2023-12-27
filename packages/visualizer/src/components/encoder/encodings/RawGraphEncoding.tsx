import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { GraphModel } from '@cm2ml/ir'
import type { HTMLAttributes, ReactNode } from 'react'
import { useMemo } from 'react'

import { colors } from '../../../colors'
import { useSelection } from '../../../lib/useSelection'
import { cn } from '../../../lib/utils'
import type { ParameterValues } from '../../Parameters'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip'

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
    <div className="h-full overflow-y-auto p-2">
      {encoding.format === 'matrix' ? (
        <Grid matrix={encoding.matrix} nodes={encoding.nodes} />
      ) : null}
      {encoding.format === 'list' ? (
        <List list={encoding.list} nodes={encoding.nodes} />
      ) : null}
    </div>
  )
}

type Matrix = number[][]

interface GridProps {
  matrix: Matrix
  nodes: string[]
}

function getLabelOffset(nodeId: string) {
  return nodeId.length * -0.65 * fontSize
}

function Grid({ matrix, nodes }: GridProps) {
  const size = cellSize * nodes.length
  const offset = useMemo(() => Math.min(...nodes.map(getLabelOffset)), [nodes])
  const viewBoxSize = size - offset
  const getOpacity = useWeightedOpacityFromMatrix(matrix)
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
            getOpacity={getOpacity}
            key={node}
            matrix={matrix}
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
      <g>
        <text
          height={cellSize}
          y={-fontSize / 2}
          x={offset}
          className="cursor-default fill-foreground font-mono"
          fontSize={fontSize}
        >
          Source
        </text>
        <text
          height={cellSize}
          y={-fontSize / 2}
          x={-offset}
          className="-rotate-90 cursor-default fill-foreground font-mono "
          fontSize={fontSize}
          text-anchor="end"
        >
          Target
        </text>
      </g>
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
  getOpacity: (weight: number) => number
  matrix: Matrix
  nodes: string[]
  row: number
}

function GridRow({ getOpacity, matrix, nodes, row }: GridRowProps) {
  return (
    <g>
      {nodes.map((_otherNode, column) => (
        <GridCell
          column={column}
          getOpacity={getOpacity}
          key={`${row}-${column}`}
          nodes={nodes}
          row={row}
          value={matrix[row]?.[column] ?? 0}
        />
      ))}
    </g>
  )
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
  const { isSelectedEdge, clearSelection, setSelection } = useSelection()
  const isCellSelected = isSelectedEdge(sourceId, targetId)
  const isActive = value > 0
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
      style={{
        opacity: getOpacity(value),
      }}
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

type AdjacencyList = (
  | readonly [number, number]
  | readonly [number, number, number]
)[]

interface ListProps {
  list: AdjacencyList
  nodes: string[]
}

function List({ list, nodes }: ListProps) {
  const getOpacity = useWeightedOpacityFromList(list)
  return (
    <div className="h-full space-y-4">
      <div>
        <span>Nodes</span>
        <div className="flex flex-wrap font-mono text-xs">
          <ListBorder>[</ListBorder>
          {nodes.map((node, index) => (
            <ListNode key={node} index={index} node={node} />
          ))}
          <ListBorder>]</ListBorder>
        </div>
      </div>
      <div>
        <span>Edges</span>
        <div className="flex flex-wrap font-mono text-xs">
          <ListBorder>[</ListBorder>
          {list.map(([source, target, weight], index) => (
            <ListEdge
              key={`${source}-${target}`}
              getOpacity={getOpacity}
              index={index}
              nodes={nodes}
              source={source}
              target={target}
              weight={weight}
            />
          ))}
          <ListBorder>]</ListBorder>
        </div>
      </div>
    </div>
  )
}

interface ListNodeProps {
  node: string
  index: number
}

function ListNode({ node, index }: ListNodeProps) {
  const { isSelectedNode, setSelection } = useSelection()
  const isSelected = isSelectedNode(node)
  return (
    <>
      {index > 0 ? <ListSeparator /> : null}
      <ListEntry onClick={() => setSelection(node)} isSelected={isSelected}>
        {node}
      </ListEntry>
    </>
  )
}

interface ListEdgeProps {
  getOpacity?: (weight: number) => number
  index: number
  nodes: string[]
  source: number
  target: number
  weight: number | undefined
}

function ListEdge({
  getOpacity,
  index,
  nodes,
  source,
  target,
  weight,
}: ListEdgeProps) {
  const { isSelectedEdge, setSelection } = useSelection()
  const sourceId = nodes[source]
  const targetId = nodes[target]
  if (!sourceId || !targetId) {
    return null
  }
  const isSelected = isSelectedEdge(sourceId, targetId)
  const isTooltipDisabled = getOpacity === undefined
  const entry = (
    <ListEntry
      key={`${source}-${target}`}
      isSelected={isSelected}
      onClick={() => setSelection([[sourceId, targetId]])}
      style={{ opacity: getOpacity?.(weight ?? 1) ?? 1 }}
    >
      [{source}, {target}]
    </ListEntry>
  )
  return (
    <>
      {index > 0 ? <ListSeparator /> : null}
      {isTooltipDisabled ? (
        entry
      ) : (
        <TooltipProvider>
          <Tooltip disableHoverableContent={isTooltipDisabled}>
            <TooltipTrigger>{entry}</TooltipTrigger>
            <TooltipContent>{weight ?? 1}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  )
}

function useRawGraphEncoding(model: GraphModel, parameters: ParameterValues) {
  return useMemo(
    () => GraphEncoder.validateAndInvoke(model, parameters),
    [model],
  )
}

function createOpacityRangeMapper(min: number, max: number) {
  const minOpacity = 0.3
  const maxOpacity = 1
  return (weight: number) =>
    minOpacity + (maxOpacity - minOpacity) * ((weight - min) / (max - min))
}

function useWeightedOpacityFromMatrix(matrix: Matrix) {
  return useMemo(() => {
    const weights = matrix.flat()
    const min = weights.reduce((min, weight) => Math.min(min, weight), Infinity)
    const max = weights.reduce((max, weight) => Math.max(max, weight), 0)
    return createOpacityRangeMapper(min, max)
  }, [matrix])
}

function useWeightedOpacityFromList(list: AdjacencyList) {
  return useMemo(() => {
    if ((list[0]?.length ?? 2) === 2) {
      return undefined
    }
    const weights = list.map(([, , weight]) => weight ?? 1)
    const min = Math.min(...weights)
    const max = Math.max(...weights)
    return createOpacityRangeMapper(min, max)
  }, list)
}

interface ListEntryProps {
  children: ReactNode
  isSelected: boolean
  onClick?: () => void
  style?: HTMLAttributes<HTMLSpanElement>['style']
}

function ListEntry({ children, isSelected, onClick, style }: ListEntryProps) {
  return (
    <div
      className={cn({
        'mx-1 my-0.5 py-0.5 px-1 rounded-sm hover:outline hover:outline-accent-foreground hover:bg-accent hover:text-accent-foreground':
          true,
        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground':
          isSelected,
      })}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  )
}

function ListSeparator() {
  return <span className="my-0.5 py-0.5">,</span>
}

function ListBorder({ children }: { children: ReactNode }) {
  return <span className="my-0.5 py-0.5 font-bold">{children}</span>
}
