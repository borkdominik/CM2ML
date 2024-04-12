import { GraphEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import type { HTMLAttributes, PointerEvent, ReactNode } from 'react'
import { useMemo } from 'react'

import { colors } from '../../../colors'
import {
  useIsSelectedEdge,
  useIsSelectedNode,
  useIsSelectedSource,
  useIsSelectedTarget,
  useSelection,
} from '../../../lib/useSelection'
import { cn } from '../../../lib/utils'
import type { ParameterValues } from '../../Parameters'
import { Hint } from '../../ui/hint'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../../ui/resizable'
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

export function RawGraphEncoding({ model, parameters }: Props) {
  const { encoding, error } = useRawGraphEncoding(model, parameters)
  if (error || !encoding) {
    return <Hint error={error} />
  }
  if (encoding.format === 'list') {
    if (encoding.list.length === 0) {
      return <Hint text="No edges" />
    }
    return <List list={encoding.list} nodes={encoding.nodes} />
  }
  if (encoding.matrix.every((row) => row.every((weight) => weight === 0))) {
    return <Hint text="No edges" />
  }
  return (
    <div className="h-full p-2">
      <Grid matrix={encoding.matrix} nodes={encoding.nodes} />
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
    setSelection({ selection: node, animate: true })
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
  matrix: Matrix
  nodes: string[]
  row: number
}

function GridRow({ getOpacity, matrix, nodes, row }: GridRowProps) {
  return nodes.map((_otherNode, column) => (
    <GridCell
      column={column}
      getOpacity={getOpacity}
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
    setSelection({ selection: [[sourceId, targetId]], animate: true })
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
  const listEdgePaddingAmount = nodes.length.toFixed(0).length
  return (
    <ResizablePanelGroup direction="vertical" className="h-full select-none">
      <ResizablePanel>
        <div className="h-full overflow-y-auto p-2">
          <span className="text-sm font-bold">Nodes</span>
          <div className="flex flex-wrap font-mono text-xs">
            <ListBorder>[</ListBorder>
            {nodes.map((node, index) => (
              <ListNode
                key={node}
                node={node}
                isLast={index === nodes.length - 1}
              />
            ))}
            <ListBorder>]</ListBorder>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <div className="h-full overflow-y-auto p-2">
          <span className="text-sm font-bold">Edges</span>
          <div className="flex flex-wrap font-mono text-xs">
            <ListBorder>[</ListBorder>
            {list.map(([source, target, weight], index) => (
              <ListEdge
                key={`${source}-${target}`}
                getOpacity={getOpacity}
                isLast={index === list.length - 1}
                nodes={nodes}
                source={source}
                target={target}
                weight={weight}
                indexPadding={listEdgePaddingAmount}
              />
            ))}
            <ListBorder>]</ListBorder>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

interface ListNodeProps {
  node: string
  isLast: boolean
}

function ListNode({ node, isLast }: ListNodeProps) {
  const isSelected = useIsSelectedNode(node)
  const setSelection = useSelection.use.setSelection()
  return (
    <ListEntry
      onClick={() => setSelection({ selection: node, animate: true })}
      isSelected={isSelected}
      isLast={isLast}
    >
      {node}
    </ListEntry>
  )
}

interface ListEdgeProps {
  getOpacity?: (weight: number) => number
  indexPadding: number
  isLast: boolean
  nodes: string[]
  source: number
  target: number
  weight: number | undefined
}

function ListEdge({
  getOpacity,
  indexPadding,
  isLast,
  nodes,
  source,
  target,
  weight,
}: ListEdgeProps) {
  const sourceId = nodes[source]
  const targetId = nodes[target]
  const isSelected = useIsSelectedEdge(sourceId, targetId)
  const setSelection = useSelection.use.setSelection()
  if (!sourceId || !targetId) {
    return null
  }
  const isTooltipDisabled = getOpacity === undefined
  function padIndex(index: number) {
    return index.toFixed(0).padStart(indexPadding, ' ')
  }
  const text = `[${padIndex(source)}, ${padIndex(target)}]`
  const entry = (
    <ListEntry
      key={`${source}-${target}`}
      isSelected={isSelected}
      onClick={() => setSelection({ selection: [[sourceId, targetId]], animate: true })}
      style={{ opacity: getOpacity?.(weight ?? 1) ?? 1 }}
      isLast={isLast}
    >
      <span className="whitespace-pre">{text}</span>
    </ListEntry>
  )
  return isTooltipDisabled
    ? entry
    : (
      <TooltipProvider>
        <Tooltip disableHoverableContent={isTooltipDisabled}>
          <TooltipTrigger>{entry}</TooltipTrigger>
          <TooltipContent>{weight ?? 1}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      )
}

function useRawGraphEncoding(model: GraphModel, parameters: ParameterValues) {
  return useMemo(() => {
    try {
      return { encoding: GraphEncoder.validateAndInvoke(model, parameters) }
    } catch (error) {
      return { error }
    }
  }, [model, parameters])
}

function createOpacityRangeMapper(min: number, max: number) {
  const minOpacity = 0.3
  const maxOpacity = 1
  if (min === max) {
    return () => maxOpacity
  }
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
  }, [list])
}

interface ListEntryProps {
  children: ReactNode
  isLast: boolean
  isSelected: boolean
  onClick?: () => void
  style?: HTMLAttributes<HTMLSpanElement>['style']
}

function ListEntry({
  children,
  isLast,
  isSelected,
  onClick,
  style,
}: ListEntryProps) {
  return (
    <div className="size-fit">
      <span
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
      </span>
      {!isLast ? <ListSeparator /> : null}
    </div>
  )
}

function ListSeparator() {
  return <span className="my-0.5 py-0.5">,</span>
}

function ListBorder({ children }: { children: ReactNode }) {
  return <span className="my-0.5 w-full py-0.5 font-bold">{children}</span>
}
