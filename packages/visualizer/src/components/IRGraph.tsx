import type { GraphEdge, GraphModel } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'
import type { Edge } from 'vis-network/standalone/esm/vis-network'
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network'

export interface Props {
  model: GraphModel
}

export function IRGraph({ model }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useVisNetwok(model, containerRef)
  return <div ref={containerRef} className="h-full"></div>
}

function useVisNetwok(
  model: GraphModel,
  container: RefObject<HTMLDivElement | null>,
) {
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
        physics: {
          // enabled: false,
        },
      },
    )
    return () => {
      network.destroy()
    }
  }, [model, container])
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
      return sourceId < targetId
        ? `${sourceId}-${targetId}`
        : `${targetId}-${sourceId}`
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
        from: source.id,
        to: target.id,
        value: Math.log10(edges.length),
      }
    })
    .filterNonNull()
    .toArray()
  return new DataSet(newMappedEdges)
}
