import type { GraphModel } from '@cm2ml/ir'
import { debounce } from '@yeger/debounce'
import { Stream } from '@yeger/streams'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Edge, Options } from 'vis-network/standalone/esm/vis-network'
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network'

import { useSelection } from '../../../lib/useSelection'
import { useVisNetworkStyles } from '../../../lib/useVisNetworkStyles'
import { cn, getIRNodeLabel } from '../../../lib/utils'
import { FitButton } from '../../FitButton'
import { Progress } from '../../ui/progress'

export interface Props {
  model: GraphModel
}

export function IRGraph({ model }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isReady, progress, fit } = useIRVisNetwork(model, containerRef)

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        data-testid="ir-graph"
        className={cn({ 'h-full': true, 'opacity-0': !isReady })}
      />
      {isReady ? <FitButton fit={fit} overlay /> : null}
      {!isReady
        ? (
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <Progress value={progress} className="max-w-56" />
            </div>
          )
        : null}
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

function useIRVisNetwork(
  model: GraphModel,
  container: RefObject<HTMLDivElement | null>,
) {
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
  const styles = useVisNetworkStyles()
  const options = useMemo<Options>(() => {
    return {
      autoResize: false,
      edges: {
        ...styles.edgeStyles,
        length: hasManyEdges ? 250 : 150,
        smooth: {
          enabled: true,
          forceDirection: false,
          roundness: 0.6,
          type: hasManyEdges ? 'discrete' : 'dynamic',
        },
      },
      interaction: {
        ...styles.interactionStyles,
      },
      layout: {
        improvedLayout: !hasManyNodes,
        randomSeed: 42,
      },
      nodes: {
        ...styles.nodeStyles,
      },
    }
  }, [hasManyNodes, hasManyEdges, styles])

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
    function selectNodes(selectedNodes: string[]) {
      if (selectedNodes.length === 1) {
        setSelection({ type: 'nodes', nodes: selectedNodes, origin: 'ir-graph' })
        return
      }
      if (selectedNodes.length === 2) {
        const [sourceId, targetId] = selectedNodes
        setSelection({ type: 'edges', edges: [[sourceId!, targetId!]], origin: 'ir-graph' })
      }
    }
    network.on(
      'stabilizationProgress',
      (params: { iterations: number, total: number }) => {
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
        setSelection({ type: 'edges', edges: [edge, reversed], origin: 'ir-graph' })
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
    if (selection.type === 'nodes') {
      if (selection.nodes.some((selectedNode) => model.getNodeById(selectedNode) === undefined)) {
        // Remove leftover selection of nodes that are no longer in the model
        clearSelection()
        return
      }
      network.selectNodes(selection.nodes)
      if (selection.origin !== 'ir-graph') {
        network.fit({ nodes: selection.nodes, animation: true })
      }
      return
    }
    const edgeIds = selection.edges.map(([sourceId, targetId]) =>
      createEdgeId(sourceId, targetId),
    )
    // Some encodings, e.g., the patterns, may try to attempt to select edges that are not in the model
    // We filter them here to prevent errors
    const filteredEdgeIds = edgeIds.filter((edgeId) => data.edges.getIds().includes(edgeId))
    network.selectEdges(filteredEdgeIds)
    if (selection.origin !== 'ir-graph') {
      network.fit({ nodes: selection.edges.flat(), animation: true })
    }
  }, [network, selection])

  return {
    isReady: stabilizationProgress === 1,
    progress: stabilizationProgress,
    fit: () => network?.fit({ animation: true }),
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
    .map((node) => {
      const outgoing = Stream.from(node.outgoingEdges).map(({ target }) => target.id)
      const incoming = Stream.from(node.incomingEdges).map(({ source }) => source.id)
      const uniqueNeighbors = outgoing.concat(incoming).filterNonNull().toSet().size
      return {
        id: node.id,
        label: getIRNodeLabel(node),
        shape: uniqueNeighbors >= 4 ? 'circle' : 'box',
      }
    })
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
