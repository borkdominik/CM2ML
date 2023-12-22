import type { GraphEdge, GraphNode } from '@cm2ml/ir'
import { create } from 'zustand'

export interface SelectionState {
  selectedNodes: Set<string>
  clearSelection: () => void
  selectEdge: (edge: GraphEdge) => void
  selectIds: (ids: string[]) => void
  selectNode: (node: GraphNode) => void
}

export const useSelection = create<SelectionState>((set, _get) => ({
  selectedNodes: new Set(),
  clearSelection: () => {
    set((_state) => ({
      selectedNodes: new Set(),
    }))
  },
  selectEdge: (edge: GraphEdge) => {
    set((_state) => {
      const nodes = new Set<string>()
      if (edge.source.id) {
        nodes.add(edge.source.id)
      }
      if (edge.target.id) {
        nodes.add(edge.target.id)
      }
      return {
        selectedNodes: nodes,
      }
    })
  },
  selectIds: (ids: string[]) => {
    set((_state) => {
      return {
        selectedNodes: new Set<string>(ids),
      }
    })
  },
  selectNode: (node: GraphNode) => {
    set((_state) => {
      // TODO: Remove
      // const nodes = new Set<string>()
      // if (node.id) {
      //   nodes.add(node.id)
      // }
      // Stream.from(node.incomingEdges)
      //   .map((edge) => edge.source.id)
      //   .filterNonNull()
      //   .forEach((nodeId) => {
      //     nodes.add(nodeId)
      //   })
      const nodes = new Set<string>()
      if (node.id) {
        nodes.add(node.id)
      }
      return {
        selectedNodes: nodes,
      }
    })
  },
}))
