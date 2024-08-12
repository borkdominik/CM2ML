import type { PathData } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { GlobeIcon } from '@radix-ui/react-icons'
import { debounce } from '@yeger/debounce'
import { Stream } from '@yeger/streams'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Options } from 'vis-network/standalone/esm/vis-network'
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network'

import { useSelection } from '../../../../lib/useSelection'
import { useVisNetworkStyles } from '../../../../lib/useVisNetworkStyles'
import { cn, getIRNodeLabel } from '../../../../lib/utils'
import { FitButton } from '../../../FitButton'
import { Button } from '../../../ui/button'
import { Progress } from '../../../ui/progress'

export interface Props {
  path: PathData
  /** Mapping from node index to node id */
  mapping: string[]
  model: GraphModel
}

export function PathGraph({ path, mapping, model }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isReady, progress, fit } = useBagOfPathsVisNetwork(path, mapping, model, containerRef)
  const setSelection = useSelection.use.setSelection()
  const selectAll = () => {
    const mappedNodes = path.steps.map((step) => mapping[step]!)
    const edges = mappedNodes.slice(0, -1).map((node, i) => [node, mappedNodes[i + 1]!] as const)
    setSelection({ type: 'edges', edges, origin: 'path' })
  }
  return (
    <div className="flex size-full min-h-80 grow">
      <div className="flex flex-col items-center gap-4 bg-muted p-2 pt-3 font-mono text-xs dark:bg-card">
        <div className="flex items-center justify-center text-center">
          <span className="w-fit cursor-default" style={{ lineHeight: 1 }}>{path.weight}</span>
        </div>
        <FitButton fit={fit} disabled={!isReady} />
        <Button className="size-4" variant="ghost" size="icon" onClick={selectAll} disabled={!isReady}>
          <GlobeIcon />
        </Button>
      </div>
      <div
        ref={containerRef}
        className={cn({ 'grow': true, 'opacity-0': !isReady })}
      />
      {!isReady
        ? (
            <div className="flex grow items-center justify-center p-2">
              <Progress value={progress} className="max-w-56" />
            </div>
          )
        : null}
    </div>
  )
}

const edgeIdSeparator = '-_$_-'

function createEdgeId(sourceId: number, targetId: number) {
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
  return [+sourceId, +targetId] as const
}

function useBagOfPathsVisNetwork(
  path: PathData,
  mapping: string[],
  model: GraphModel,
  container: RefObject<HTMLDivElement | null>,
) {
  const selection = useSelection.use.selection()
  const setSelection = useSelection.use.setSelection()
  const clearSelection = useSelection.use.clearSelection()
  const [network, setNetwork] = useState<Network | null>(null)
  const [stabilizationProgress, setStabilizationProgress] = useState(0)

  const data = useMemo(() => {
    const nodes = createVisNodes(path, mapping, model)
    const edges = createVisEdges(path)
    return { nodes, edges }
  }, [path])

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
        length: 150,
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
    function selectNodes(selectedNodes: number[]) {
      if (selectedNodes.length === 0) {
        return
      }
      const mappedNodeIds = Stream.from(selectedNodes).map((selectedNode) => mapping[selectedNode]).filterNonNull().toArray()
      setSelection({ type: 'nodes', nodes: mappedNodeIds, origin: 'path-graph' })
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
    network.on('dragStart', (params: { nodes: number[] }) => {
      selectNodes(params.nodes)
    })
    network.on('selectNode', (params: { nodes: number[] }) => {
      selectNodes(params.nodes)
    })
    network.on('selectEdge', (params: { edges: string[] }) => {
      const selectedEdges = params.edges
      if (selectedEdges.length === 1) {
        const edge = splitEdgeId(selectedEdges[0])
        if (!edge) {
          return
        }
        const [source, target] = edge
        const mappedSourceId = mapping[source]!
        const mappedTargetId = mapping[target]!
        setSelection({ type: 'edges', edges: [[mappedSourceId, mappedTargetId]], origin: 'path-graph' })
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
    const reverseMapping: Record<string, number> = Object.fromEntries(mapping.map((nodeId, nodeIndex) => [nodeId, nodeIndex]))
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
      const mappedSelection = Stream.from(selection.nodes)
        .map((selectedNode) => reverseMapping[selectedNode])
        .filterNonNull()
        .filter((nodeIndex) => data.nodes.getIds().includes(nodeIndex))
        .toArray()
      network.selectNodes(mappedSelection)
      if (selection.origin !== 'path-graph' && mappedSelection.length > 0) {
        network.fit({ nodes: mappedSelection, animation: true })
      }
      return
    }
    const mappedEdges = Stream.from(selection.edges)
      .map(([sourceId, targetId]) => {
        const mappedSourceIds = reverseMapping[sourceId]
        const mappedTargetIds = reverseMapping[targetId]
        if (mappedSourceIds === undefined || mappedTargetIds === undefined) {
          return undefined
        }
        return [mappedSourceIds, mappedTargetIds] as const
      })
      .filterNonNull()
      .filter(([sourceId, targetId]) => {
        const nodeIds = data.nodes.getIds()
        return nodeIds.includes(sourceId) && nodeIds.includes(targetId)
      })
      .toArray()
    // Some encodings, e.g., the patterns, may try to attempt to select edges that are not in the model
    // We filter them here to prevent errors
    const filteredEdgeIds = mappedEdges
      .map(([sourceId, targetId]) =>
        createEdgeId(sourceId, targetId),
      )
      .filter((edgeId) => data.edges.getIds().includes(edgeId))
    network.selectEdges(filteredEdgeIds)
    if (selection.origin !== 'path-graph' && filteredEdgeIds.length > 0) {
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

function createVisNodes(path: PathData, mapping: string[], model: GraphModel) {
  const mappedNodes = Stream
    .from(path.steps)
    .distinct()
    .map((node) => {
      const mappedNode = model.getNodeById(mapping[node]!)!
      return {
        id: node,
        label: getIRNodeLabel(mappedNode),
        shape: 'box',
      }
    })
    .toArray()

  return new DataSet(mappedNodes)
}

function createVisEdges(path: PathData) {
  const edges = Stream
    .from(path.steps)
    .limit(path.steps.length - 1)
    .map((source, i) => {
      const target = path.steps[i + 1]!
      const edgeId = createEdgeId(source, target)
      return {
        id: edgeId,
        from: source,
        to: target,
        value: path.stepWeights[i],
      }
    })
    .toArray()
  return new DataSet(edges)
}
