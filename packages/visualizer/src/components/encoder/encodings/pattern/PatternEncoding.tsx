import { PatternMiner } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { ExecutionError } from '@cm2ml/plugin'
import { DownloadIcon } from '@radix-ui/react-icons'
import type { Viz } from '@viz-js/viz'
import { instance } from '@viz-js/viz'
import { Fragment, useMemo } from 'react'

import type { Selection } from '../../../../lib/useSelection'
import { useSelection } from '../../../../lib/useSelection'
import type { ParameterValues } from '../../../Parameters'
import { SelectButton } from '../../../SelectButton'
import { Button } from '../../../ui/button'
import { Hint } from '../../../ui/hint'
import { Separator } from '../../../ui/separator'
import { useEncoder } from '../../useEncoder'

import { PatternGraph } from './PatternGraph'

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

export function PatternEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(PatternMiner, model, parameters)
  if (error || !encoding) {
    return <Hint error={error} />
  }
  if (encoding.data instanceof ExecutionError) {
    return <Hint error={encoding.data} />
  }
  const patterns = encoding.metadata
  if (patterns.length === 0) {
    return <Hint text="No patterns found. Consider increasing the maximum pattern length if mining closed patterns. Otherwise, try configuring the parser and encoder to reduce the model complexity." />
  }
  const mapping = encoding.data
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {patterns.map(({ pattern, absoluteFrequency, graph }, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={i}>
          {i > 0 ? <Separator /> : null}
          <Pattern pattern={pattern} absoluteFrequency={absoluteFrequency} graph={graph} mapping={mapping} />
        </Fragment>
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
  // Use a fragment as the root to put both the list and the graph into the same container
  // This way, the graph can be sized independently of the list
  const download = async (format: 'svg') => {
    const viz = await getInstance()
    const svg = viz.renderString(graph, { format })
    const blob = new Blob([svg], { type: format === 'svg' ? 'image/svg+xml' : undefined })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pattern.svg'
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <>
      <div className="bg-muted p-2">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="cursor-default">
            {`${absoluteFrequency} occurrence${absoluteFrequency === 1 ? '' : 's'}`}
          </span>
          <div className="flex flex-wrap gap-2">
            <div>
              <Button variant="ghost" onClick={() => download('svg')} size="icon">
                <DownloadIcon />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col text-xs">
          {
            pattern.map((edge) => (
              <LabeledEdge key={`${edge.source}->${edge.target}[${edge.tag}]`} edge={edge} mapping={mapping} />
            ))
          }
        </div>
      </div>
      <Separator />
      <PatternGraph pattern={pattern} mapping={mapping} />
    </>
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
    <span key={edge.source + edge.target + edge.tag} className="cursor-default">
      <LabeledNode nodeId={edge.source} mapping={mapping} isEdgeSelected={isSelected} />
      {' '}
      →
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
