import { create } from 'zustand'

import { createSelectors } from './utils'

export type NodeSelection = string

export type EdgeSelection = (readonly [string, string])[]

export type Selection = NodeSelection | EdgeSelection

export interface SelectionState {
  selection: Selection | undefined
  clearSelection: () => void
  setSelection: (ids: Selection) => void
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
  if (typeof selection === 'string') {
    return selection === id
  }
  return false
}

export function useIsSelectedSource(id: string | undefined) {
  const selection = useSelection.use.selection()
  if (id === undefined || selection === undefined) {
    return false
  }
  if (typeof selection === 'string') {
    return selection === id
  }
  return selection.some(([sourceId]) => sourceId === id)
}

export function useIsSelectedTarget(id: string | undefined) {
  const selection = useSelection.use.selection()
  if (id === undefined || selection === undefined) {
    return false
  }
  if (typeof selection === 'string') {
    return selection === id
  }
  return selection.some(([_, targetId]) => targetId === id)
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
  if (typeof selection === 'string') {
    return selection === sourceId || selection === targetId
  }
  return selection.some(([sId, tId]) => sId === sourceId && tId === targetId)
}
