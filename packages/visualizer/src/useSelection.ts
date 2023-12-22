import { create } from 'zustand'

export type Selection = (readonly [string, string])[] | string

export interface SelectionState {
  selection: Selection | undefined
  clearSelection: () => void
  isSelectedNode: (id: string | undefined) => boolean
  isSelectedEdge: (
    sourceId: string | undefined,
    targetId: string | undefined,
  ) => boolean
  isSelectedSource: (id: string | undefined) => boolean
  isSelectedTarget: (id: string | undefined) => boolean
  setSelection: (ids: Selection) => void
}

export const useSelection = create<SelectionState>((set, get) => ({
  selection: undefined,
  isSelectedNode: (id: string | undefined) => {
    const selection = get().selection
    if (id === undefined || selection === undefined) {
      return false
    }
    if (typeof selection === 'string') {
      return selection === id
    }
    return false
  },
  isSelectedEdge: (
    sourceId: string | undefined,
    targetId: string | undefined,
  ) => {
    const selection = get().selection
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
  },
  isSelectedSource: (id: string | undefined) => {
    const selection = get().selection
    if (id === undefined || selection === undefined) {
      return false
    }
    if (typeof selection === 'string') {
      return selection === id
    }
    return selection.some(([sourceId]) => sourceId === id)
  },
  isSelectedTarget: (id: string | undefined) => {
    const selection = get().selection
    if (id === undefined || selection === undefined) {
      return false
    }
    if (typeof selection === 'string') {
      return selection === id
    }
    return selection.some(([_, targetId]) => targetId === id)
  },
  clearSelection: () => {
    set((_state) => ({
      selection: undefined,
    }))
  },
  setSelection: (selection: Selection) => {
    set((_state) => {
      return {
        selection,
      }
    })
  },
}))
