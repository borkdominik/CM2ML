import { BagOfPathsEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { ExecutionError } from '@cm2ml/plugin'
import type { Viz } from '@viz-js/viz'
import { instance } from '@viz-js/viz'
import { useEffect, useMemo, useState } from 'react'

import type { Selection } from '../../../../lib/useSelection'
import { useSelection } from '../../../../lib/useSelection'
import type { ParameterValues } from '../../../Parameters'
import { SelectButton } from '../../../SelectButton'
import { Hint } from '../../../ui/hint'
import { useEncoder } from '../../useEncoder'

let cachedInstance: Viz | null = null
async function getInstance() {
  if (!cachedInstance) {
    cachedInstance = await instance()
  }
  return cachedInstance
}

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

export function BagOfPathsEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(BagOfPathsEncoder, model, parameters)
  if (error || !encoding) {
    return <Hint error={error} />
  }
  if (encoding.data instanceof ExecutionError) {
    return <Hint error={encoding.data} />
  }
  const patterns = encoding.metadata
  const mapping = encoding.data
  return (
    <div className="h-full overflow-y-auto px-4 py-2">
      {patterns.map(({ pattern, absoluteFrequency, graph }, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Pattern key={i} pattern={pattern} absoluteFrequency={absoluteFrequency} graph={graph} mapping={mapping} />
      ))}
    </div>
  )
}

interface PatternProps {
  pattern: {
    source: string
    target: string
    tag: string
  }[]
  absoluteFrequency: number
  graph: string
  mapping: Record<string, string[]>
}

function Pattern({ pattern, absoluteFrequency, mapping, graph }: PatternProps) {
  const [renderedGraph, setRenderedGraph] = useState<string | null>(null)
  useEffect(() => {
    async function renderGraph() {
      const viz = await getInstance()
      const renderedGraph = encodeURIComponent(viz.renderString(graph, { format: 'svg' }))
      setRenderedGraph(renderedGraph)
    }
    renderGraph()
  }, [])
  return (
    <div className="flex w-full justify-between">
      <div className="max-h-fit">
        <span className="text-sm">
          {' '}
          {`${absoluteFrequency} occurrences`}
        </span>
        <div className="flex flex-col pl-4 text-xs">
          {
            pattern.map((edge) => (
              <LabeledEdge key={`${edge.source}->${edge.target}[${edge.tag}]`} edge={edge} mapping={mapping} />
            ))
          }
        </div>
      </div>
      <div className="max-h-full overflow-y-auto">
        {renderedGraph ? <img className="h-full" src={`data:image/svg+xml;utf8,${renderedGraph}`} /> : null }
      </div>
    </div>
  )
}

interface LabeledEdgeProps {
  edge: {
    source: string
    target: string
    tag: string
  }
  mapping: Record<string, string[]>
}

function mapsToGraphNode(patternNodeId: string, mapping: Record<string, string[]>, graphNodeId: string) {
  return mapping[patternNodeId]?.includes(graphNodeId) ?? false
}

function LabeledEdge({ edge, mapping }: LabeledEdgeProps) {
  const selection = useSelection.use.selection()
  const isSelected = useMemo(() => {
    if (selection?.type !== 'edges') {
      return false
    }
    return selection.edges
      .some(([source, target]) => mapsToGraphNode(edge.source, mapping, source) && mapsToGraphNode(edge.target, mapping, target))
  }, [edge, mapping, selection])

  const selectionToMake: Selection = useMemo(() => {
    const edges = (mapping[edge.source] ?? []).flatMap((source) => (mapping[edge.target] ?? []).map((target) => [source, target] as const))
    return {
      type: 'edges',
      edges,
      origin: 'pattern',
    }
  }, [edge, mapping])
  return (
    <span key={edge.source + edge.target + edge.tag}>
      <LabeledNode nodeId={edge.source} mapping={mapping} isEdgeSelected={isSelected} />
      {' '}
      {'->'}
      {' '}
      <LabeledNode nodeId={edge.target} mapping={mapping} isEdgeSelected={isSelected} />
      {' '}
      [
      <SelectButton text={edge.tag} selection={selectionToMake} isSelected={isSelected} />
      ]
      {' '}
    </span>
  )
}

interface LabeledNodeProps {
  nodeId: string
  mapping: Record<string, string[]>
  isEdgeSelected: boolean
}

function LabeledNode({ isEdgeSelected, nodeId, mapping }: LabeledNodeProps) {
  const selection = useSelection.use.selection()
  const isSelected = useMemo(() => {
    if (isEdgeSelected) {
      return true
    }
    if (!selection) {
      return false
    }
    if (selection?.type !== 'nodes') {
      return false
    }
    return selection.nodes.some((selectedNode) => mapsToGraphNode(nodeId, mapping, selectedNode))
  }, [nodeId, mapping, selection])
  return (
    <SelectButton text={nodeId} selection={{ type: 'nodes', nodes: mapping[nodeId] ?? [], origin: 'pattern' }} isSelected={isSelected} />
  )
}

// interface ColumnProps {
//   itemSet: Embedding
//   row: number
// }

// function Row({ itemSet, row }: ColumnProps) {
//   return (
//     <tr className="flex w-full justify-between gap-4">
//       {itemSet.map((column, i) => (
//         // eslint-disable-next-line react/no-array-index-key
//         <td key={i} style={{ 'flexGrow': i === 0 ? 1 : 0 }}>
//           {column[row]}
//         </td>
//       ))}
//     </tr>

//   )
// }

// interface ItemSetProps {
//   itemSet: Embedding
// }

// // TODO/Jan: Use virtualized list?
// // TODO/Jan: Enable selections -> Include mapping to original graph via metadata (must be done for each partition!)
// // Add toggle param to emit this extra data
// // TODO/Jan: Also emit the labeled partition graphs via metadata and render them here
// function ItemSet({ itemSet }: ItemSetProps) {
//   return (
//     <table className="mx-auto font-mono text-xs">
//       <tbody className="flex flex-col gap-1">
//         {itemSet[0].map((_, i) => (
//           <Row key={itemSet[0][i]} itemSet={itemSet} row={i} />
//         ))}
//       </tbody>
//     </table>
//   )
// }
