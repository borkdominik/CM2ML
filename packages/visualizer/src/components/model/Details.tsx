import type {
  Attributable,
  GraphEdge,
  GraphModel,
  GraphNode,
  ModelMember,
} from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import { Fragment, useMemo } from 'react'

import { useModelState } from '../../lib/useModelState'
import type { EdgeSelection } from '../../lib/useSelection'
import { useSelection } from '../../lib/useSelection'
import { Button } from '../ui/button'
import { Hint } from '../ui/hint'
import { Separator } from '../ui/separator'

export function SelectionDetails() {
  const model = useModelState.use.model()
  const selection = useSelection.use.selection()
  if (!model || !selection) {
    return <Hint text="Select a node or edge by clicking on it" />
  }
  if (typeof selection === 'string') {
    const node = model.getNodeById(selection)
    if (!node) {
      return null
    }
    return <NodeDetails node={node} />
  }
  const edges = getEdges(selection, model)
  return <EdgeList edges={edges} />
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
  const name = node.getAttribute('name')?.value.literal
  return (
    <div className="space-y-2 p-2">
      <div className="text-sm font-bold">
        {node.tag}
        {name ? ` — ${name}` : null}
      </div>
      <AttributableDetails attributable={node} />
      {node.parent
        ? (
          <div className="space-y-2">
            <div className="text-sm font-bold">Parent</div>
            <div className="grid grid-cols-[min-content,_auto] items-center gap-2 text-xs">
              <div className="whitespace-pre-wrap text-muted-foreground">
                {node.parent.tag}
              </div>
              <NodeSelectionButton id={node.parent.id} />
            </div>
          </div>
          )
        : null}
      <div className="space-y-2">
        <div className="text-sm font-bold">Children</div>
        <NodeChildren node={node} />
      </div>
      <NodeEdges type="outgoing" node={node} />
      <NodeEdges type="incoming" node={node} />
    </div>
  )
}

function NodeChildren({ node }: { node: GraphNode }) {
  const sortedChildren = useMemo(
    () =>
      [...node.children].sort(
        (a, b) =>
          (a.tag.localeCompare(b.tag) || a.id?.localeCompare(b.id ?? '')) ?? 0,
      ),
    [node],
  )

  if (sortedChildren.length === 0) {
    return <div className="text-xs text-muted-foreground">No children</div>
  }

  return (
    <div className="grid grid-cols-[min-content,_auto] items-center gap-2 text-xs">
      {sortedChildren.map((child) => (
        <Fragment key={child.id}>
          <div className="whitespace-pre-wrap text-muted-foreground">
            {child.tag}
          </div>
          <NodeSelectionButton id={child.id} />
        </Fragment>
      ))}
    </div>
  )
}

function NodeEdges({
  type,
  node,
}: {
  type: 'incoming' | 'outgoing'
  node: GraphNode
}) {
  const edges = type === 'incoming' ? node.incomingEdges : node.outgoingEdges
  const sortedEdges = useMemo(
    () => [...edges].sort((a, b) => a.tag.localeCompare(b.tag)),
    [edges],
  )

  if (sortedEdges.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-bold">
        {type === 'incoming' ? 'Incoming Edges' : 'Outgoing Edges'}
      </div>
      <div className="grid grid-cols-[min-content,_min-content,_auto] items-center gap-2 text-xs">
        {sortedEdges.map((edge) => (
          <Fragment key={`${edge.source.id}-${edge.tag}-${edge.target.id}`}>
            <EdgeSelectionButton
              sourceId={edge.source.id}
              targetId={edge.target.id}
              label={edge.tag}
            />
            {type === 'incoming'
              ? (
                <>
                  <span className="text-muted-foreground">from</span>
                  <NodeSelectionButton id={edge.source.id} />
                </>
                )
              : (
                <>
                  <span className="text-muted-foreground">to</span>
                  <NodeSelectionButton id={edge.target.id} />
                </>
                )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function NodeSelectionButton({ id }: { id: string | undefined }) {
  const setSelection = useSelection.use.setSelection()
  if (id === undefined) {
    return null
  }
  return (
    <Button
      variant="link"
      className="size-fit p-0 font-mono text-xs"
      onClick={() => setSelection(id)}
    >
      {id}
    </Button>
  )
}

function EdgeSelectionButton({
  sourceId,
  targetId,
  label,
}: {
  sourceId: string | undefined
  targetId: string | undefined
  label: string
}) {
  const setSelection = useSelection.use.setSelection()
  if (sourceId === undefined || targetId === undefined) {
    return null
  }
  return (
    <Button
      variant="link"
      className="size-fit p-0 font-mono text-xs"
      onClick={() => setSelection([[sourceId, targetId]])}
    >
      {label}
    </Button>
  )
}

function EdgeList({ edges }: { edges: GraphEdge[] }) {
  const groups = useMemo(() => Object.entries(groupBy(edges, (edge) => edge.source.id ?? '')), [edges])
  return groups.map(([groupKey, group], index) => (
    <Fragment key={groupKey}>
      <EdgeGroup edges={group ?? []} />
      {index !== edges.length - 1 ? <Separator /> : null}
    </Fragment>
  ))
}

function EdgeGroup({ edges }: { edges: GraphEdge[] }) {
  const firstEdge = edges[0]
  if (!firstEdge) {
    return null
  }
  return (
    <div className="space-y-4 p-2">
      <div className="space-y-2">
        <div className="text-sm font-bold">Source</div>
        <div className="grid grid-cols-[min-content,_auto] items-center gap-2 text-xs">
          <div className="whitespace-pre-wrap text-muted-foreground">
            {firstEdge.source.tag}
          </div>
          <NodeSelectionButton id={firstEdge.source.id} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-bold">Target</div>
        <div className="grid grid-cols-[min-content,_auto] items-center gap-2 text-xs">
          <div className="whitespace-pre-wrap text-muted-foreground">
            {firstEdge.target.tag}
          </div>
          <NodeSelectionButton id={firstEdge.target.id} />
        </div>
      </div>
      {edges.map((edge, index) => (
        <EdgeDetails edge={edge} key={index} />
      ))}
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

function AttributableDetails({
  attributable,
}: {
  attributable: Attributable & ModelMember
}) {
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
          {attributable.model.getNodeById(attribute.value.literal) !==
          undefined &&
          attribute.name !== attributable.model.settings.idAttribute
            ? (
              <NodeSelectionButton id={attribute.value.literal} />
              )
            : (
              <div className="whitespace-pre-wrap">{attribute.value.literal}</div>
              )}
        </Fragment>
      ))}
    </div>
  )
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce(
    (acc, item) => {
      const group = key(item)
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group]?.push(item)
      return acc
    },
    {} as Record<string, T[]>,
  )
}
