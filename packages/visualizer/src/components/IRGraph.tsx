import type { GraphEdge, GraphModel } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Edge } from 'vis-network/standalone/esm/vis-network'
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network'

import { colors } from '../colors'
import { useSelection } from '../selection'

export interface Props {
  model: GraphModel
}

export function IRGraph({ model }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useVisNetwok(model, containerRef)
  return <div ref={containerRef} className="h-full"></div>
}
const edgeIdSeparator = '-_$_-'

function splitEdgeId(edgeId: string) {
  const [sourceId, targetId] = edgeId.split(edgeIdSeparator)
  if (!sourceId || !targetId) {
    return undefined
  }
  return [sourceId, targetId]
}

function createEdgeId(sourceId: string, targetId: string) {
  return sourceId < targetId
    ? `${sourceId}${edgeIdSeparator}${targetId}`
    : `${targetId}${edgeIdSeparator}${sourceId}`
}

function useVisNetwok(
  model: GraphModel,
  container: RefObject<HTMLDivElement | null>,
) {
  const { selectedNodes, selectIds, clearSelection } = useSelection()
  const [network, setNetwork] = useState<Network | null>(null)
  useEffect(() => {
    if (!container.current) {
      return
    }
    const nodes = createVisNodes(model)
    const edges = createVisEdges(model)
    const isLargeModel = edges.length > 1000
    const network = new Network(
      container.current,
      { nodes, edges },
      {
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
      selectIds(params.nodes)
    })
    network.on('selectEdge', (params: { edges: string[] }) => {
      const nodeIds = params.edges.flatMap(
        (edgeId) => splitEdgeId(edgeId) ?? [],
      )
      selectIds(nodeIds)
    })
    network.on('deselectNode', clearSelection)
    network.on('deselectEdge', clearSelection)
    const resizeObserver = new ResizeObserver(() => {
      network.fit()
    })
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
    if (selectedNodes.size === 0) {
      network.unselectAll()
      return
    }
    if (selectedNodes.size === 1) {
      const [nodeId] = selectedNodes
      network.selectNodes([nodeId!])
      return
    }
    if (selectedNodes.size === 2) {
      const nodeIds = Array.from(selectedNodes)
      // network.selectNodes([nodeIds[0]!, nodeIds[1]!])
      network.selectEdges([createEdgeId(nodeIds[0]!, nodeIds[1]!)])
    }
  }, [network, selectedNodes])
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
