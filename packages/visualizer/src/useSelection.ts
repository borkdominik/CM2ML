import { create } from 'zustand'

export type Selection = readonly [string, string] | string

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
    if (id === undefined) {
      return false
    }
    const selection = get().selection
    if (typeof selection === 'string') {
      return selection === id
    }
    return false
  },
  isSelectedEdge: (
    sourceId: string | undefined,
    targetId: string | undefined,
  ) => {
    if (sourceId === undefined || targetId === undefined) {
      return false
    }
    const selection = get().selection
    if (Array.isArray(selection)) {
      return selection[0] === sourceId && selection[1] === targetId
    }
    return selection === sourceId || selection === targetId
  },
  isSelectedSource: (id: string | undefined) => {
    if (id === undefined) {
      return false
    }
    const selection = get().selection
    if (Array.isArray(selection)) {
      return selection[0] === id
    }
    return selection === id
  },
  isSelectedTarget: (id: string | undefined) => {
    if (id === undefined) {
      return false
    }
    const selection = get().selection
    if (Array.isArray(selection)) {
      return selection[1] === id
    }
    return selection === id
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
