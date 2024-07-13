import type {
  Attributable,
  GraphEdge,
  GraphModel,
  GraphNode,
  ModelMember,
} from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import { Fragment, useMemo } from 'react'

import { prettifyParserName } from '../../lib/pluginNames'
import { useModelState } from '../../lib/useModelState'
import type { EdgeSelection } from '../../lib/useSelection'
import { useSelection } from '../../lib/useSelection'
import { SelectButton } from '../SelectButton'
import { Hint } from '../ui/hint'
import { Separator } from '../ui/separator'

export function SelectionDetails() {
  const model = useModelState.use.model()
  const selection = useSelection.use.selection()
  const hint = <Hint text="Select a node or edge by clicking on it" />
  if (!model) {
    return hint
  }
  if (!selection) {
    return (
      <div className="items flex size-full flex-col">
        {hint}
        <ModelStats model={model} />
      </div>
    )
  }
  if (selection.type === 'nodes') {
    const nodes = selection.nodes.map((selectedNode) => model.getNodeById(selectedNode)).filter((node) => node !== undefined)
    if (nodes.length === 0) {
      return null
    }
    if (nodes.length === 1) {
      return <NodeDetails node={nodes[0]!} />
    }
    return (
      <div className="flex flex-col gap-2">
        {nodes.map((node, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            {i > 0 ? <Separator /> : null}
            <NodeDetails node={node} />
          </Fragment>
        ))}
      </div>
    )
  }
  const edges = getEdges(selection, model)
  return <EdgeList edges={edges} />
}

function ModelStats({ model }: { model: GraphModel }) {
  const parserName = useModelState.use.parser()?.name
  const { nodes, edges, attributes, languageName } = useMemo(() => {
    const nodes = model.nodes.size
    const edges = model.edges.size
    const attributes = Stream.from<Attributable>(model.nodes).concat(model.edges).map((attributable) => attributable.attributes.size).sum()
    const languageName = parserName ? prettifyParserName(parserName) : undefined
    return { nodes, edges, attributes, languageName }
  }, [model, parserName])

  const hasMetadata = Object.keys(model.metadata).length > 0

  return (
    <div className="text-muted-foreground flex size-full items-center justify-center gap-1 font-mono text-xs" data-testid="model-stats">
      <div className="flex size-full flex-col items-center justify-center">
        <div>
          {languageName}
          {' '}
          model
        </div>
        <div>
          {nodes}
          {' '}
          nodes
        </div>
        <div>
          {edges}
          {' '}
          edges
        </div>
        <div>
          {attributes}
          {' '}
          attributes
        </div>
      </div>
      {hasMetadata
        ? (
            <div className="flex size-full flex-col items-center justify-center">
              <div>
                Metadata
              </div>
              {Object.entries(model.metadata).map(([key, value]) => (
                <div key={key}>
                  {key}
                  {' '}
                  {value}
                </div>
              ))}
            </div>
          )
        : null}
    </div>
  )
}

function getEdges(edgeSelection: EdgeSelection, model: GraphModel) {
  const edges: GraphEdge[] = []
  edgeSelection.edges.forEach(([sourceId, targetId]) => {
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
                <div className="text-muted-foreground whitespace-pre-wrap">
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
    return <div className="text-muted-foreground text-xs">No children</div>
  }

  return (
    <div className="grid grid-cols-[min-content,_auto] items-center gap-2 text-xs">
      {sortedChildren.map((child) => (
        <Fragment key={child.id}>
          <div className="text-muted-foreground whitespace-pre-wrap">
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
    () => Array.from(edges).sort((a, b) => a.tag.localeCompare(b.tag)),
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
          <Fragment key={`${edge.source.id}-${edge.show()}-${edge.target.id}`}>
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
  if (id === undefined) {
    return null
  }
  return (
    <SelectButton
      text={id}
      selection={
        { type: 'nodes', nodes: [id], origin: 'details' }
      }
    />
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
  if (sourceId === undefined || targetId === undefined) {
    return null
  }
  return (<SelectButton text={label} selection={{ type: 'edges', edges: [[sourceId, targetId]], origin: 'details' }} />)
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
          <div className="text-muted-foreground whitespace-pre-wrap">
            {firstEdge.source.tag}
          </div>
          <NodeSelectionButton id={firstEdge.source.id} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-bold">Target</div>
        <div className="grid grid-cols-[min-content,_auto] items-center gap-2 text-xs">
          <div className="text-muted-foreground whitespace-pre-wrap">
            {firstEdge.target.tag}
          </div>
          <NodeSelectionButton id={firstEdge.target.id} />
        </div>
      </div>
      {edges.map((edge, index) => (
        // eslint-disable-next-line react/no-array-index-key
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
    return <div className="text-muted-foreground text-xs">No attributes</div>
  }

  return (
    <div className="grid grid-cols-[min-content,_auto] gap-2 text-xs">
      {attributes.map(([name, attribute]) => (
        <Fragment key={name}>
          <div key={name} className="text-muted-foreground font-mono">
            {name}
          </div>
          {attributable.model.getNodeById(attribute.value.literal) !==
          undefined &&
          attribute.name !== attributable.model.metamodel.idAttribute
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
