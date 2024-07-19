import type { PatternWithFrequency } from '@cm2ml/builtin'
import { Crosshair2Icon } from '@radix-ui/react-icons'
import { debounce } from '@yeger/debounce'
import { Stream } from '@yeger/streams'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Edge, Options } from 'vis-network/standalone/esm/vis-network'
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network'

import { useSelection } from '../../../../lib/useSelection'
import { useVisNetworkStyles } from '../../../../lib/useVisNetworkStyles'
import { cn } from '../../../../lib/utils'
import { Button } from '../../../ui/button'
import { Progress } from '../../../ui/progress'

export type Pattern = PatternWithFrequency['pattern']

export interface Props {
  pattern: Pattern
  mapping: Record<string, string[]>
}

export interface IRGraphRef {
  fit?: () => void
}

export function PatternGraph({ pattern, mapping }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isReady, progress, fit } = usePatternVisNetwork(pattern, mapping, containerRef)

  return (
    <div className="relative size-full min-h-80 grow">
      <div
        ref={containerRef}
        className={cn({ 'h-full': true, 'opacity-0': !isReady })}
      />
      {isReady
        ? (
            <Button className="absolute right-2 top-2" variant="ghost" size="icon" onClick={fit}>
              <Crosshair2Icon />
            </Button>
          )
        : null}
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
  return `${sourceId}${edgeIdSeparator}${targetId}`
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

function usePatternVisNetwork(
  pattern: Pattern,
  mapping: Record<string, string[]>,
  container: RefObject<HTMLDivElement | null>,
) {
  const selection = useSelection.use.selection()
  const setSelection = useSelection.use.setSelection()
  const clearSelection = useSelection.use.clearSelection()
  const [network, setNetwork] = useState<Network | null>(null)
  const [stabilizationProgress, setStabilizationProgress] = useState(0)

  const data = useMemo(() => {
    const nodes = createVisNodes(pattern)
    const edges = createVisEdges(pattern)
    return { nodes, edges }
  }, [pattern])

  const hasManyEdges = data.edges.length > 1000
  const hasManyNodes = data.nodes.length > 100
  const styles = useVisNetworkStyles()
  const options = useMemo<Options>(() => {
    return {
      autoResize: false,
      edges: {
        ...styles.edgeStyles,
        arrows: {
          to: true,
        },
        length: 500,
        smooth: {
          enabled: true,
          forceDirection: false,
          roundness: 0.6,
          type: 'dynamic',
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
      if (selectedNodes.length === 0) {
        return
      }
      const mappedNodeIds = selectedNodes.flatMap((selectedNode) => mapping[selectedNode] ?? [])
      setSelection({ type: 'nodes', nodes: mappedNodeIds, origin: 'pattern-graph' })
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
        const mappedEdges = [edge, reversed].flatMap(([source, target]) => {
          const mappedSourceIds = mapping[source] ?? []
          const mappedTargetIds = mapping[target] ?? []
          return mappedSourceIds.flatMap((mappedSourceId) =>
            mappedTargetIds.map((mappedTargetId) => [mappedSourceId, mappedTargetId] as const),
          )
        })
        setSelection({ type: 'edges', edges: mappedEdges, origin: 'pattern-graph' })
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
  }, [container, mapping])

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

  const reverseMapping = useMemo(() => {
    const reverseMapping: Record<string, string[]> = {}
    Object.entries(mapping).forEach(([labeledNode, nodeIds]) => {
      nodeIds.forEach((nodeId) => {
        reverseMapping[nodeId] = [...(reverseMapping[nodeId] ?? []), labeledNode]
      })
    })
    return reverseMapping
  }, [mapping])

  useEffect(() => {
    if (isNetworkDestroyed(network)) {
      return
    }
    if (selection === undefined) {
      network.unselectAll()
      return
    }
    if (selection.type === 'nodes') {
      const mappedSelection = selection.nodes
        .flatMap((selectedNode) => reverseMapping[selectedNode] ?? [])
        .filter((nodeId) => data.nodes.getIds().includes(nodeId))
      network.selectNodes(mappedSelection)
      if (selection.origin !== 'pattern-graph') {
        network.fit({ nodes: mappedSelection, animation: true })
      }
      return
    }
    const mappedEdges = selection.edges.flatMap(([sourceId, targetId]) => {
      const mappedSourceIds = reverseMapping[sourceId] ?? []
      const mappedTargetIds = reverseMapping[targetId] ?? []
      return mappedSourceIds.flatMap((mappedSourceId) =>
        mappedTargetIds.map((mappedTargetId) => [mappedSourceId, mappedTargetId] as const),
      )
    }).filter(([sourceId, targetId]) => {
      const nodeIds = data.nodes.getIds()
      return nodeIds.includes(sourceId) && nodeIds.includes(targetId)
    })
    // Some encodings, e.g., the patterns, may try to attempt to select edges that are not in the model
    // We filter them here to prevent errors
    const filteredEdgeIds = mappedEdges
      .map(([sourceId, targetId]) =>
        createEdgeId(sourceId, targetId),
      )
      .filter((edgeId) => data.edges.getIds().includes(edgeId))
    network.selectEdges(filteredEdgeIds)
    if (selection.origin !== 'pattern-graph') {
      network.fit({ nodes: mappedEdges.flat(), animation: true })
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

function createVisNodes(pattern: Pattern) {
  const mappedNodes = Stream
    .from(pattern)
    .flatMap(({ source, target }) => [source, target])
    .distinct()
    .map((node) => ({
      id: node,
      label: node,
    }))
    .toArray()

  return new DataSet(mappedNodes)
}

function createVisEdges(pattern: Pattern) {
  const edgeMap: Record<string, Edge> = {}
  Stream.from(pattern).forEach(({ source, target, tag }) => {
    const edgeId = createEdgeId(source, target)
    const networkEdge: Edge = edgeMap[edgeId] ?? {
      id: edgeId,
      from: source,
      to: target,
    }
    networkEdge.value = (networkEdge.value ?? 0) + 1
    networkEdge.label = (networkEdge.label ? `${networkEdge.label},\n` : '') + tag
    edgeMap[edgeId] = networkEdge
  })
  const edges = Object.values(edgeMap).map((edge) => ({
    ...edge,
    value: Math.log10((edge.value ?? 0) + 1),
  }))
  return new DataSet(edges)
}
