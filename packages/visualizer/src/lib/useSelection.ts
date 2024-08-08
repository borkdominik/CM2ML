import { create } from 'zustand'

import { createSelectors } from './utils'

export interface NodeSelection {
  type: 'nodes'
  nodes: string[]
}

export interface EdgeSelection {
  type: 'edges'
  edges: ([string, string] | readonly [string, string])[]
}

export type Selection = {
  origin: 'command' | 'details' | 'graph' | 'ir-graph' | 'path-graph' | 'pattern' | 'pattern-graph' | 'tree'
} & (NodeSelection | EdgeSelection)

export interface SelectionState {
  selection: Selection | undefined
  clearSelection: () => void
  setSelection: (selection: Selection) => void
}

const defaults = {
  selection: undefined,
} as const satisfies Partial<SelectionState>

export const useSelection = createSelectors(
  create<SelectionState>((set, _get) => ({
    selection: defaults.selection,
    clearSelection: () =>
      set({
        selection: undefined,
      }),
    setSelection: (selection: Selection) => {
      set({
        selection,
      })
    },
  })),
)

export function useIsSelectedNode(id: string | undefined) {
  const selection = useSelection.use.selection()
  if (id === undefined || selection === undefined) {
    return false
  }
  if (selection.type === 'nodes') {
    return selection.nodes.includes(id)
  }
  return false
}

export function useIsSelectedSource(id: string | undefined) {
  const selection = useSelection.use.selection()
  if (id === undefined || selection === undefined) {
    return false
  }
  if (selection.type === 'nodes') {
    return selection.nodes.includes(id)
  }
  return selection.edges.some(([sourceId]) => sourceId === id)
}

export function useIsSelectedTarget(id: string | undefined) {
  const selection = useSelection.use.selection()
  if (id === undefined || selection === undefined) {
    return false
  }
  if (selection.type === 'nodes') {
    return selection.nodes.includes(id)
  }
  return selection.edges.some(([_, targetId]) => targetId === id)
}

export function useIsSelectedEdge(
  sourceId: string | undefined,
  targetId: string | undefined,
) {
  const selection = useSelection.use.selection()
  if (
    sourceId === undefined ||
    targetId === undefined ||
    selection === undefined
  ) {
    return false
  }
  if (selection.type === 'nodes') {
    return selection.nodes.some((selectedNode) => selectedNode === sourceId || selectedNode === targetId)
  }
  return selection.edges.some(([sId, tId]) => sId === sourceId && tId === targetId)
}
