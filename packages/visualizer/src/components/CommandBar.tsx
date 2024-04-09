import type { Attributable, GraphModel } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import * as React from 'react'
import { useCallback, useEffect, useMemo } from 'react'

import { useModelState } from '../lib/useModelState'
import { useSelection } from '../lib/useSelection'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

export function CommandBar() {
  const [open, setOpen] = React.useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const closeDialog = useCallback(() => setOpen(false), [])

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Commands"
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <ModelCommandGroups closeDialog={closeDialog} />
        </CommandList>
      </CommandDialog>
    </>
  )
}

interface ModelCommandGroupsProps {
  closeDialog: () => void
}

function ModelCommandGroups({ closeDialog }: ModelCommandGroupsProps) {
  const model = useModelState.use.model()
  if (!model) {
    return null
  }
  return (
    <>
      <NodeSearchCommandGroup model={model} closeDialog={closeDialog} />
      <CommandSeparator />
      <EdgeSearchCommandGroup model={model} closeDialog={closeDialog} />
    </>
  )
}

interface NodeSearchCommandGroupProps extends ModelCommandGroupsProps {
  model: GraphModel
}

function NodeSearchCommandGroup({ model, closeDialog }: NodeSearchCommandGroupProps) {
  const setSelection = useSelection.use.setSelection()
  const searchableNodes = useMemo(() =>
    Stream.from(model.nodes)
      .map((node) => {
        const id = node.id
        if (!id) {
          return undefined
        }
        const label = node.getAttribute('name')?.value.literal
        const keywords = getKeywords(node)
        return { label, id, keywords }
      })
      .filterNonNull()
      .toArray()
      .sort(compareByLabelOrId), [model])

  if (searchableNodes.length === 0) {
    return null
  }

  return (
    <CommandGroup heading="Nodes">
      {
            searchableNodes.map(({ label, id, keywords }) => (
              <CommandItem
                key={id}
                onSelect={() => {
                  setSelection({ selection: id, animate: true })
                  closeDialog()
                }}
                keywords={keywords}
              >
                {label ?? id}
              </CommandItem>
            ))
          }
    </CommandGroup>
  )
}

interface EdgeSearchCommandGroupProps extends ModelCommandGroupsProps {
  model: GraphModel
}

function EdgeSearchCommandGroup({ model, closeDialog }: EdgeSearchCommandGroupProps) {
  const setSelection = useSelection.use.setSelection()
  const searchableEdges = useMemo(() =>
    Stream.from(model.edges)
      .map((edge) => {
        const sourceId = edge.source.id
        const targetId = edge.target.id
        if (!sourceId || !targetId) {
          return undefined
        }
        const selection = [edge.source.id, edge.target.id] as const
        const id = edge.show()
        const tag = edge.tag
        const label = edge.getAttribute('name')?.value.literal
        const keywords = getKeywords(edge)
        return { selection, label, id, tag, keywords }
      })
      .filterNonNull()
      .toArray()
      .sort(compareByLabelOrId), [model])

  if (searchableEdges.length === 0) {
    return null
  }

  return (
    <CommandGroup heading="Edges">
      {
            searchableEdges.map(({ selection, label, id, tag, keywords }) => (
              <CommandItem
                key={id}
                onSelect={() => {
                  setSelection({ selection: [selection], animate: true })
                  closeDialog()
                }}
                keywords={keywords}
              >
                {label ?? tag}
              </CommandItem>
            ))
          }
    </CommandGroup>
  )
}

function compareByLabelOrId(a: { label?: string, id: string }, b: { label?: string, id: string }) {
  if (a.label && b.label) {
    return a.label.localeCompare(b.label)
  }
  if (a.label && !b.label) {
    return -1
  }
  if (!a.label && b.label) {
    return 1
  }
  return a.id.localeCompare(b.id)
}

function getKeywords(attributable: Attributable) {
  return Stream.from(attributable.attributes).map(([name, attribute]) => `${name}=${attribute.value.literal}`).toArray()
}
