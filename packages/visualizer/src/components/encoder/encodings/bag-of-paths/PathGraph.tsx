import type { EncodedPath } from '@cm2ml/builtin'
import { GlobeIcon } from '@radix-ui/react-icons'
import { debounce } from '@yeger/debounce'
import { Stream } from '@yeger/streams'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Options } from 'vis-network/standalone/esm/vis-network'
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network'

import { useSelection } from '../../../../lib/useSelection'
import { useVisNetworkStyles } from '../../../../lib/useVisNetworkStyles'
import { cn } from '../../../../lib/utils'
import { FitButton } from '../../../FitButton'
import { Button } from '../../../ui/button'
import { Progress } from '../../../ui/progress'

export interface Props {
  path: EncodedPath
  /** Mapping from node index to node id */
  mapping: string[]
}

export function PathGraph({ path, mapping }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isReady, progress, fit } = useBagOfPathsVisNetwork(path, mapping, containerRef)
  const setSelection = useSelection.use.setSelection()
  const selectAll = () => {
    const mappedNodes = path.nodes.map(([nodeIndex]) => mapping[nodeIndex]!)
    const edges = mappedNodes.slice(0, -1).map((node, i) => [node, mappedNodes[i + 1]!] as const)
    setSelection({ type: 'edges', edges, origin: 'path' })
  }
  return (
    <div data-testid="path-graph" className="flex size-full min-h-80 grow">
      <div className="flex flex-col items-center gap-4 bg-muted p-2 pt-3 font-mono text-xs dark:bg-card">
        <div data-testid="path-graph-weight" className="flex items-center justify-center text-center">
          <span className="w-fit cursor-default" style={{ lineHeight: 1 }}>{path.weight.toFixed(2)}</span>
        </div>
        <FitButton data-testid="path-graph-fit" fit={fit} disabled={!isReady} />
        <Button data-testid="path-graph-select-all" className="size-4" variant="ghost" size="icon" onClick={selectAll} disabled={!isReady}>
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

const ID_SEPARATOR = '-_$_-'

function createEdgeId(source: number, sourceVersion: number, target: number, targetVersion: number) {
  return `${source}${ID_SEPARATOR}${sourceVersion}${ID_SEPARATOR}${target}${ID_SEPARATOR}${targetVersion}`
}

function splitEdgeId(edgeId: string | undefined) {
  if (!edgeId) {
    return undefined
  }
  const [source, sourceVersion, target, targetVersion] = edgeId.split(ID_SEPARATOR)
  if (!source || !sourceVersion || !target || !targetVersion) {
    return undefined
  }
  return [+source, +sourceVersion, +target, +targetVersion] as const
}

function createNodeId(nodeIndex: number, version: number) {
  return `${nodeIndex}${ID_SEPARATOR}${version}`
}

function splitNodeId(nodeId: string) {
  const [nodeIndex, version] = nodeId.split(ID_SEPARATOR)
  if (!nodeIndex || !version) {
    return undefined
  }
  return [+nodeIndex, +version] as const
}

function useBagOfPathsVisNetwork(
  path: EncodedPath,
  mapping: string[],
  container: RefObject<HTMLDivElement | null>,
) {
  const selection = useSelection.use.selection()
  const setSelection = useSelection.use.setSelection()
  const clearSelection = useSelection.use.clearSelection()
  const [network, setNetwork] = useState<Network | null>(null)
  const [stabilizationProgress, setStabilizationProgress] = useState(0)

  const data = useMemo(() => {
    const { dataset: nodes, nodeEncodingVersions } = createVisNodes(path)
    const edges = createVisEdges(path, nodeEncodingVersions)
    return { nodes, edges, nodeEncodingVersions }
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
        length: 300,
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
      const mappedNodeIds = Stream.from(selectedNodes).map((nodeId) => splitNodeId(nodeId)![0]).map((selectedNode) => mapping[selectedNode]).filterNonNull().toArray()
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
        const [source, _, target, __] = edge
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
        .flatMap((nodeIndex) => {
          const versionCount = data.nodeEncodingVersions.get(nodeIndex)?.size
          if (versionCount === undefined) {
            return []
          }
          return Array.from({ length: versionCount }, (_, version) => createNodeId(nodeIndex, version))
        })
        .filter((nodeId) =>
          data.nodes.getIds().includes(nodeId),
        )
        .toArray()
      network.selectNodes(mappedSelection)
      if (selection.origin !== 'path-graph' && mappedSelection.length > 0) {
        network.fit({ nodes: mappedSelection, animation: true })
      }
      return
    }
    const mappedEdges = Stream.from(selection.edges)
      .flatMap(([sourceId, targetId]) => {
        const mappedSourceIds = reverseMapping[sourceId]
        const mappedTargetIds = reverseMapping[targetId]
        if (mappedSourceIds === undefined || mappedTargetIds === undefined) {
          return []
        }
        const sourceVersionCount = data.nodeEncodingVersions.get(mappedSourceIds)?.size
        const targetVersionCount = data.nodeEncodingVersions.get(mappedTargetIds)?.size
        if (sourceVersionCount === undefined || targetVersionCount === undefined) {
          return []
        }
        const sourceVersions = Array.from({ length: sourceVersionCount })
        const targetVersions = Array.from({ length: targetVersionCount })
        return sourceVersions.flatMap((_, sourceVersion) => targetVersions.map((_, targetVersion) => [mappedSourceIds, sourceVersion, mappedTargetIds, targetVersion] as const))
      })
      .filter(([source, sourceVersion, target, targetVersion]) => {
        const nodeIds = data.nodes.getIds()
        return nodeIds.includes(createNodeId(source, sourceVersion)) && nodeIds.includes(createNodeId(target, targetVersion))
      })
      .toArray()
    // Some encodings, e.g., the patterns, may try to attempt to select edges that are not in the model
    // We filter them here to prevent errors
    const filteredEdgeIds = mappedEdges
      .flatMap(([source, sourceVersion, target, targetVersion]) => createEdgeId(source, sourceVersion, target, targetVersion))
      .filter((edgeId) => data.edges.getIds().includes(edgeId))

    network.selectEdges(filteredEdgeIds)
    if (selection.origin !== 'path-graph' && filteredEdgeIds.length > 0) {
      network.fit({ nodes: mappedEdges.flatMap(([source, sourceVersion, target, targetVersion]) => [createNodeId(source, sourceVersion), createNodeId(target, targetVersion)]), animation: true })
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

/** Mapping from the node encoding to its indices  */
type NodeEncodingVersions = Map<string | null, number>

function createVisNodes(path: EncodedPath) {
  const nodeEncodingVersions = new Map<number, NodeEncodingVersions>()
  const mappedNodes = Stream
    .from(path.nodes)
    .map(([nodeIndex, nodeEncoding]) => {
      if (!nodeEncodingVersions.has(nodeIndex)) {
        nodeEncodingVersions.set(nodeIndex, new Map())
      }
      const previousEncodings = nodeEncodingVersions.get(nodeIndex)!
      if (previousEncodings.has(nodeEncoding)) {
        return undefined
      }
      const version = previousEncodings.size
      previousEncodings.set(nodeEncoding, version)
      return {
        id: createNodeId(nodeIndex, version),
        label: nodeEncoding ?? undefined,
        shape: 'box',
      }
    })
    .filterNonNull()
    .toArray()
  return { dataset: new DataSet(mappedNodes), nodeEncodingVersions }
}

function createVisEdges(path: EncodedPath, nodeEncodingVersions: Map<number, NodeEncodingVersions>) {
  const includedIds = new Set<string>()
  const edges = Stream
    .from(path.edges)
    .map((edge, i) => {
      const [source, sourceEncoding] = path.nodes[i]!
      const [target, targetEncoding] = path.nodes[i + 1]!
      const sourceVersion = nodeEncodingVersions.get(source)!.get(sourceEncoding)!
      const targetVersion = nodeEncodingVersions.get(target)!.get(targetEncoding)!
      const edgeId = createEdgeId(source, sourceVersion, target, targetVersion)
      if (includedIds.has(edgeId)) {
        return undefined
      }
      includedIds.add(edgeId)
      return {
        id: edgeId,
        from: createNodeId(source, sourceVersion),
        to: createNodeId(target, targetVersion),
        label: edge ?? undefined,
        value: path.stepWeights[i],
      }
    })
    .filterNonNull()
    .toArray()
  return new DataSet(edges)
}
