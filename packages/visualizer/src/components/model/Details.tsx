import type { Attributable, GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import { Fragment, useMemo } from 'react'

import { useModelState } from '../../lib/useModelState'
import type { EdgeSelection } from '../../lib/useSelection'
import { useSelection } from '../../lib/useSelection'
import { Badge } from '../ui/badge'

export function SelectionDetails() {
  const { model } = useModelState()
  const { selection } = useSelection()
  if (!model || !selection) {
    return (
      <div className="flex h-full items-center justify-center">
        <Badge variant="outline">Select a node or edge by clicking on it</Badge>
      </div>
    )
  }
  if (typeof selection === 'string') {
    const node = model.getNodeById(selection)
    if (!node) {
      return null
    }
    return <NodeDetails node={node} />
  }
  const edges = getEdges(selection, model)
  return (
    <div className="space-y-2 p-2">
      {edges.map((edge, index) => (
        <EdgeDetails key={index} edge={edge} />
      ))}
    </div>
  )
}

function getEdges(edgeSelection: EdgeSelection, model: GraphModel) {
  const edges: GraphEdge[] = []
  edgeSelection.forEach(([sourceId, targetId]) => {
    const sourceNode = model.getNodeById(sourceId)
    if (!sourceNode) {
      return
    }
    Stream.from(sourceNode.outgoingEdges)
      .filter((edge) => edge.target.id === targetId)
      .forEach((edge) => edges.push(edge))
  })
  return edges.sort((a, b) => a.tag.localeCompare(b.tag))
}

function NodeDetails({ node }: { node: GraphNode }) {
  return (
    <div className="space-y-2 p-2">
      <div className="text-sm font-bold">{node.id}</div>
      <AttributableDetails attributable={node} />
      {/* TODO: Children */}
    </div>
  )
}

function EdgeDetails({ edge }: { edge: GraphEdge }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-bold">{edge.tag}</div>
      <AttributableDetails attributable={edge} />
    </div>
  )
}

function AttributableDetails({ attributable }: { attributable: Attributable }) {
  const attributes = useMemo(
    () =>
      [...attributable.attributes.entries()].sort(([a], [b]) =>
        a.localeCompare(b),
      ),
    [attributable],
  )

  if (attributes.length === 0) {
    return <div className="text-xs text-muted-foreground">No attributes</div>
  }

  return (
    <div className="grid grid-cols-[min-content,_auto] gap-2 text-xs">
      {attributes.map(([name, attribute]) => (
        <Fragment key={name}>
          <div key={name} className="font-mono text-muted-foreground">
            {name}
          </div>
          <div className="whitespace-pre-wrap">{attribute.value.literal}</div>
        </Fragment>
      ))}
    </div>
  )
}
