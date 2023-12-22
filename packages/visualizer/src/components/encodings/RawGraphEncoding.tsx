import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { useMemo } from 'react'

const cellSize = 25

export interface Props {
  model: GraphModel
}

export function RawGraphEncoding({ model }: Props) {
  const encoding = useRawGraphEncoding(model)
  return (
    <div className="p-4">
      <Grid connections={encoding.connections} nodes={encoding.nodes} />
    </div>
  )
}

type Connections = Record<number, Set<number>>

interface GridProps {
  connections: Connections
  nodes: string[]
}

function Grid({ connections: connectedNodes, nodes }: GridProps) {
  const size = cellSize * nodes.length
  return (
    <svg
      height={size}
      width={size}
      viewBox={`0 0 ${size} ${size}`}
      className="h-full w-full"
    >
      {nodes.map((node, row) => (
        <GridRow
          connections={connectedNodes}
          key={node}
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
  node: string
  nodes: string[]
  row: number
}

function GridRow({ connections, node, nodes, row }: GridRowProps) {
  return (
    <>
      {/* TODO */}
      {/* <text>{node}</text> */}
      {nodes.map((_otherNode, column) => (
        <GridCell
          column={column}
          isActive={connections[row]?.has(column) ?? false}
          row={row}
        />
      ))}
    </>
  )
}

interface GridCellProps {
  column: number
  isActive: boolean
  row: number
}

function GridCell({ column, isActive, row }: GridCellProps) {
  return (
    <rect
      height={cellSize}
      width={cellSize}
      key={`${column}-${row}`}
      x={cellSize * column}
      y={cellSize * row}
      fill={isActive ? 'blue' : 'white'}
      stroke={'white'}
    />
  )
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
