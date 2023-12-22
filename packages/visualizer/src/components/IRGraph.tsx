import type { GraphModel } from '@cm2ml/ir'
import { debounce } from '@yeger/debounce'
import { Stream } from '@yeger/streams'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Edge, Options } from 'vis-network/standalone/esm/vis-network'
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network'

import { colors } from '../colors'
import { cn } from '../lib/utils'
import { useSelection } from '../useSelection'

import { Button } from './ui/button'

export interface Props {
  model: GraphModel
}

export function IRGraph({ model }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { fit, isLoading } = useVisNetwok(model, containerRef)
  return (
    <div className="relative h-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-y-2 border-neutral-950 dark:border-neutral-50" />
      </div>
      <div
        ref={containerRef}
        className={cn({
          'absolute inset-0 ': true,
          'bg-white': !isLoading,
        })}
      />
      {isLoading ? null : (
        <div className="absolute inset-x-2 top-2 z-10">
          <Button onClick={fit} className="text-xs">
            Fit
          </Button>
        </div>
      )}
    </div>
  )
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
  const { data, options } = useMemo(() => {
    const nodes = createVisNodes(model)
    const edges = createVisEdges(model)
    const isLargeModel = edges.length > 1000
    const options: Options = {
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
          border: colors.activeBorder,
          background: colors.background,
          highlight: {
            border: colors.selected,
          },
        },
      },
    }
    return { data: { nodes, edges }, options }
  }, [model])

  useEffect(() => {
    if (!container.current) {
      return
    }
    const network = new Network(container.current, data, options)
    setNetwork(network)
    function selectNodes(selectedNodes: string[]) {
      if (selectedNodes.length === 1) {
        setSelection(selectedNodes[0]!)
        return
      }
      if (selectedNodes.length === 2) {
        const [sourceId, targetId] = selectedNodes
        setSelection([[sourceId!, targetId!]])
      }
    }
    network.on('dragStart', (params: { nodes: string[] }) => {
      selectNodes(params.nodes)
    })
    network.on('selectNode', (params: { nodes: string[] }) => {
      selectNodes(params.nodes)
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
  }, [container, data, options])

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

  return {
    isLoading: !network,
    fit: () => network?.fit(),
  }
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
  const edgeMap: Record<string, Edge> = {}
  Stream.from(model.edges).forEach((edge) => {
    const sourceId = edge.source.id
    const targetId = edge.target.id
    if (!sourceId || !targetId) {
      return
    }
    const edgeId = createEdgeId(sourceId, targetId)
    const networkEdge: Edge = edgeMap[edgeId] ?? {
      id: edgeId,
      from: sourceId,
      to: targetId,
    }
    networkEdge.value = (networkEdge.value ?? 0) + 1
    edgeMap[edgeId] = networkEdge
  })
  const edges = Object.values(edgeMap).map((edge) => ({
    ...edge,
    value: Math.log10(edge.value ?? 1),
  }))
  return new DataSet(edges)
}
