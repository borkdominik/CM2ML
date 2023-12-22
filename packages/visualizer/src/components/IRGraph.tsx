import type { GraphEdge, GraphModel } from '@cm2ml/ir'
import { debounce } from '@yeger/debounce'
import { Stream } from '@yeger/streams'
import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Edge } from 'vis-network/standalone/esm/vis-network'
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network'

import { colors } from '../colors'
import { useSelection } from '../useSelection'

export interface Props {
  model: GraphModel
}

export function IRGraph({ model }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useVisNetwok(model, containerRef)
  return <div ref={containerRef} className="h-full"></div>
}

const edgeIdSeparator = '-_$_-'

function createEdgeId(sourceId: string, targetId: string) {
  return sourceId < targetId
    ? `${sourceId}${edgeIdSeparator}${targetId}`
    : `${targetId}${edgeIdSeparator}${sourceId}`
}

function splitEdgeId(edgeId: string | undefined) {
  if (!edgeId) {
    return undefined
  }
  const [sourceId, targetId] = edgeId.split(edgeIdSeparator)
  if (!sourceId || !targetId) {
    return undefined
  }
  return [sourceId, targetId] as const
}

function useVisNetwok(
  model: GraphModel,
  container: RefObject<HTMLDivElement | null>,
) {
  const { selection, setSelection, clearSelection } = useSelection()
  const [network, setNetwork] = useState<Network | null>(null)
  useEffect(() => {
    if (!container.current) {
      return
    }
    const nodes = createVisNodes(model)
    const edges = createVisEdges(model)
    const isLargeModel = edges.length > 1000
    // TODO: Disable multi select
    const network = new Network(
      container.current,
      { nodes, edges },
      {
        autoResize: false,
        edges: {
          color: {
            color: colors.active,
            highlight: colors.selected,
          },
          length: isLargeModel ? 250 : undefined,
          scaling: {
            min: 1,
            max: 7,
          },
          smooth: {
            enabled: true,
            forceDirection: false,
            roundness: 0.6,
            type: isLargeModel ? 'discrete' : 'dynamic',
          },
        },
        nodes: {
          color: {
            highlight: {
              border: colors.selected,
            },
          },
        },
      },
    )
    setNetwork(network)
    network.on('selectNode', (params: { nodes: string[] }) => {
      const selectedNodes = params.nodes
      if (selectedNodes.length === 1) {
        setSelection(selectedNodes[0]!)
        return
      }
      if (selectedNodes.length === 2) {
        const [sourceId, targetId] = selectedNodes
        setSelection([[sourceId!, targetId!]])
      }
    })
    network.on('selectEdge', (params: { edges: string[] }) => {
      const selectedEdges = params.edges
      if (selectedEdges.length === 1) {
        const edge = splitEdgeId(selectedEdges[0])
        if (!edge) {
          return
        }
        const reversed = edge.toReversed() as [string, string]
        setSelection([edge, reversed])
      }
    })
    network.on('deselectNode', clearSelection)
    network.on('deselectEdge', clearSelection)
    const resizeObserver = new ResizeObserver(
      debounce(() => {
        network.redraw()
        network.fit()
      }),
    )
    resizeObserver.observe(container.current)
    return () => {
      network.destroy()
      resizeObserver.disconnect()
      setNetwork(null)
    }
  }, [model, container])
  useEffect(() => {
    if (!network) {
      return
    }
    if (selection === undefined) {
      network.unselectAll()
      return
    }
    if (typeof selection === 'string') {
      network.selectNodes([selection])
      return
    }
    const edgeIds = selection.map(([sourceId, targetId]) =>
      createEdgeId(sourceId, targetId),
    )
    network.selectEdges(edgeIds)
  }, [network, selection])
}

function createVisNodes(model: GraphModel) {
  const mappedNodes = Stream.from(model.nodes)
    .map(({ id, tag }) => ({
      id,
      label: tag,
    }))
    .toArray()
  return new DataSet(mappedNodes)
}

function createVisEdges(model: GraphModel) {
  // @ts-expect-error Broken types
  const groups: Record<string, GraphEdge[]> = Object.groupBy(
    model.edges,
    // @ts-expect-error Broken types
    ({ source, target }) => {
      const sourceId = source.id
      const targetId = target.id
      if (!sourceId || !targetId) {
        return undefined
      }
      // Maintain stable order to also merge reverse-directed edges
      return createEdgeId(sourceId, targetId)
    },
  )
  const newMappedEdges = Stream.fromObject(groups)
    .map<Edge | null>(([_key, edges]) => {
      const [firstEdge] = edges
      if (!firstEdge) {
        return null
      }
      const { source, target } = firstEdge
      if (!source.id || !target.id) {
        return null
      }
      return {
        id: createEdgeId(source.id, target.id),
        from: source.id,
        to: target.id,
        value: Math.log10(edges.length),
      }
    })
    .filterNonNull()
    .toArray()
  return new DataSet(newMappedEdges)
}
