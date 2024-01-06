import type { GraphModel } from '@cm2ml/ir'
import { debounce } from '@yeger/debounce'
import { Stream } from '@yeger/streams'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Edge, Options } from 'vis-network/standalone/esm/vis-network'
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network'

import { colors } from '../../colors'
import { useModelState } from '../../lib/useModelState'
import { useSelection } from '../../lib/useSelection'
import { cn } from '../../lib/utils'
import { Progress } from '../ui/progress'

export interface Props {
  model: GraphModel
}

export interface IRGraphRef {
  fit?: () => void
}

export function IRGraph({ model }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isReady, progress } = useVisNetwok(model, containerRef)
  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        className={cn({ 'h-full': true, 'opacity-0': !isReady })}
      />
      {!isReady ? (
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <Progress value={progress} className="max-w-56" />
        </div>
      ) : null}
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
  const setFit = useModelState.use.setFit()
  const selection = useSelection.use.selection()
  const setSelection = useSelection.use.setSelection()
  const clearSelection = useSelection.use.clearSelection()
  const [network, setNetwork] = useState<Network | null>(null)
  const [stabilizationProgress, setStabilizationProgress] = useState(0)

  const data = useMemo(() => {
    const nodes = createVisNodes(model)
    const edges = createVisEdges(model)
    return { nodes, edges }
  }, [model])

  const hasManyEdges = data.edges.length > 1000
  const hasManyNodes = data.nodes.length > 100
  const options = useMemo<Options>(() => {
    return {
      autoResize: false,
      edges: {
        color: {
          color: colors.active,
          highlight: colors.selectedBackground,
        },
        length: hasManyEdges ? 250 : undefined,
        scaling: {
          min: 2,
          max: 5,
        },
        selectionWidth: 2,
        smooth: {
          enabled: true,
          forceDirection: false,
          roundness: 0.6,
          type: hasManyEdges ? 'discrete' : 'dynamic',
        },
      },
      nodes: {
        borderWidth: 2,
        color: {
          border: colors.activeBorder,
          background: colors.activeBackground,
          highlight: {
            background: colors.selectedBackground,
            border: colors.selected,
          },
        },
      },
      layout: {
        improvedLayout: !hasManyNodes,
      },
    }
  }, [hasManyNodes, hasManyEdges])

  useEffect(() => {
    if (!container.current) {
      return
    }

    const network = new Network(
      container.current,
      { nodes: undefined, edges: undefined },
      options,
    )
    setNetwork(network)
    setFit(() => network.fit())
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
    network.on(
      'stabilizationProgress',
      (params: { iterations: number; total: number }) => {
        setStabilizationProgress((100 * params.iterations) / params.total)
      },
    )
    network.on('stabilizationIterationsDone', () => {
      setStabilizationProgress(1)
      network.storePositions()
    })
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
      setNetwork(null)
      setFit(undefined)
      network.destroy()
      resizeObserver.disconnect()
    }
  }, [container])

  useEffect(() => {
    if (isNetworkDestroyed(network)) {
      return
    }
    network.setData(data)
  }, [network, data])
  useEffect(() => {
    if (isNetworkDestroyed(network)) {
      return
    }
    network.setOptions(options)
  }, [network, options])

  useEffect(() => {
    if (isNetworkDestroyed(network)) {
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
    isReady: stabilizationProgress === 1,
    progress: stabilizationProgress,
  }
}

/**
 * This check is required for dev-mode HMR only.
 * network.destroy() removes the selectionHandler and other internal functions of the network.
 * This causes an error when the network is accessed.
 */
function isNetworkDestroyed(network: Network | null): network is null {
  if (network === null) {
    return true
  }
  return !('selectionHandler' in network)
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
    value: Math.log10((edge.value ?? 0) + 1),
  }))
  return new DataSet(edges)
}
