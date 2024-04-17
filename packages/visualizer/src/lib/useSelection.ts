import { create } from 'zustand'

import { createSelectors } from './utils'

export type NodeSelection = string

export type EdgeSelection = (readonly [string, string])[]

export interface Selection {
  selection: NodeSelection | EdgeSelection
  animate?: boolean
}

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

export function isNodeSelection(selection: NodeSelection | EdgeSelection): selection is NodeSelection {
  return typeof selection === 'string'
}

export function useIsSelectedNode(id: string | undefined) {
  const { selection } = useSelection.use.selection() ?? {}
  if (id === undefined || selection === undefined) {
    return false
  }
  if (isNodeSelection(selection)) {
    return selection === id
  }
  return false
}

export function useIsSelectedSource(id: string | undefined) {
  const { selection } = useSelection.use.selection() ?? {}
  if (id === undefined || selection === undefined) {
    return false
  }
  if (isNodeSelection(selection)) {
    return selection === id
  }
  return selection.some(([sourceId]) => sourceId === id)
}

export function useIsSelectedTarget(id: string | undefined) {
  const { selection } = useSelection.use.selection() ?? {}
  if (id === undefined || selection === undefined) {
    return false
  }
  if (isNodeSelection(selection)) {
    return selection === id
  }
  return selection.some(([_, targetId]) => targetId === id)
}

export function useIsSelectedEdge(
  sourceId: string | undefined,
  targetId: string | undefined,
) {
  const { selection } = useSelection.use.selection() ?? {}
  if (
    sourceId === undefined ||
    targetId === undefined ||
    selection === undefined
  ) {
    return false
  }
  if (isNodeSelection(selection)) {
    return selection === sourceId || selection === targetId
  }
  return selection.some(([sId, tId]) => sId === sourceId && tId === targetId)
}
