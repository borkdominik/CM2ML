import type { Attributable, GraphModel } from '@cm2ml/ir'
import { ResetIcon, Share2Icon } from '@radix-ui/react-icons'
import { Stream } from '@yeger/streams'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { displayName } from '../lib/displayName'
import { useShare } from '../lib/sharing'
import { useModelState } from '../lib/useModelState'
import { useSelection } from '../lib/useSelection'
import { irViews, layouts, useSettings } from '../lib/useSettings'
import { themes, useTheme } from '../lib/useTheme'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

function commandFilter(value: string, search: string, keywords: string[] | undefined) {
  const extendedValue = `${value} ${keywords?.join(' ')}`.toLowerCase()
  const searchSegments = search.toLowerCase().split(' ')
  let matches = 0
  for (const searchSegment of searchSegments) {
    if (!extendedValue.includes(searchSegment)) {
      return 0
    }
    matches += 1
  }
  return matches
}

export function CommandBar() {
  const [open, setOpen] = useState(false)

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
    <CommandDialog open={open} onOpenChange={setOpen} filter={commandFilter}>
      <CommandInput
        placeholder="Commands"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <ViewCommandGroups closeDialog={closeDialog} />
        <SystemCommandGroup closeDialog={closeDialog} />
        <ModelCommandGroups closeDialog={closeDialog} />
      </CommandList>
    </CommandDialog>
  )
}

interface CommandProps {
  closeDialog: () => void
}

function ViewCommandGroups({ closeDialog }: CommandProps) {
  return (
    <>
      <IRViewCommandGroup closeDialog={closeDialog} />
      <ThemeCommandGroup closeDialog={closeDialog} />
      <LayoutCommandGroup closeDialog={closeDialog} />
    </>
  )
}

function IRViewCommandGroup({ closeDialog }: CommandProps) {
  const irView = useSettings.use.irView()
  const setIRView = useSettings.use.setIRView()
  const availableViews = useMemo(() => irViews.filter((view) => view !== irView), [irView])
  return (
    <CommandGroup heading="Model View">
      {availableViews.map((view) => (
        <CommandItem
          onSelect={() => {
            setIRView(view)
            closeDialog()
          }}
          key={view}
        >
          {displayName(view)}
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

function ThemeCommandGroup({ closeDialog }: CommandProps) {
  const currentTheme = useTheme.use.theme()
  const setTheme = useTheme.use.setTheme()
  const availableThemes = useMemo(() => themes.filter((theme) => theme !== currentTheme), [currentTheme])
  return (
    <CommandGroup heading="Theme">
      {availableThemes.map((theme) => (
        <CommandItem
          onSelect={() => {
            setTheme(theme)
            closeDialog()
          }}
          key={theme}
        >
          {displayName(theme)}
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

function LayoutCommandGroup({ closeDialog }: CommandProps) {
  const currentLayout = useSettings.use.layout()
  const setLayout = useSettings.use.setLayout()
  const availableViews = useMemo(() => layouts.filter((layout) => layout !== currentLayout), [currentLayout])
  return (
    <CommandGroup heading="Layout">
      {availableViews.map((layout) => (
        <CommandItem
          onSelect={() => {
            setLayout(layout)
            closeDialog()
          }}
          key={layout}
        >
          {displayName(layout)}
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

function SystemCommandGroup({ closeDialog }: CommandProps) {
  return (
    <CommandGroup heading="System">
      <ClearCommand closeDialog={closeDialog} />
      <ShareCommand closeDialog={closeDialog} />
    </CommandGroup>
  )
}

function ClearCommand({ closeDialog }: CommandProps) {
  const clearEncoder = useModelState.use.clear()
  const clearModel = useModelState.use.clear()
  const clearSelection = useSelection.use.clearSelection()

  function clear() {
    clearModel()
    clearEncoder()
    clearSelection()
    closeDialog()
  }

  return (
    <CommandItem
      onSelect={clear}
    >
      <ResetIcon className="mr-2 size-4" />
      Clear
    </CommandItem>
  )
}

function ShareCommand({ closeDialog }: CommandProps) {
  const { share } = useShare()
  return (
    <CommandItem onSelect={() => {
      share()
      closeDialog()
    }}
    >
      <Share2Icon className="mr-2 size-4" />
      Share
    </CommandItem>
  )
}

interface ModelCommandGroupsProps extends CommandProps {
}

function ModelCommandGroups({ closeDialog }: ModelCommandGroupsProps) {
  const model = useModelState.use.model()
  if (!model) {
    return null
  }
  return (
    <>
      <NodeSearchCommandGroup model={model} closeDialog={closeDialog} />
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
        const label = node.name
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
              setSelection({
                type: 'nodes',
                nodes: [id],
                origin: 'command',
              })
              closeDialog()
            }}
            value={id}
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
        const selection = [sourceId, targetId] as const
        const id = edge.show()
        const tag = edge.tag
        const label = edge.name
        const keywords = getKeywords(edge)
        return { selection, label, id, tag, keywords }
      })
      .filterNonNull()
      .toArray()
      .sort(compareByLabelOrTag), [model])

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
              setSelection({ type: 'edges', edges: [selection], origin: 'command' })
              closeDialog()
            }}
            value={id}
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

function compareByLabelOrTag(a: { label?: string, tag: string }, b: { label?: string, tag: string }) {
  if (a.label && b.label) {
    return a.label.localeCompare(b.label)
  }
  if (a.label && !b.label) {
    return -1
  }
  if (!a.label && b.label) {
    return 1
  }
  return a.tag.localeCompare(b.tag)
}

function getKeywords(attributable: Attributable) {
  return Stream.from(attributable.attributes).map(([name, attribute]) => `${name}=${attribute.value.literal}`).toArray()
}
