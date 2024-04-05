import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { CommandGroup } from 'cmdk'
import * as React from 'react'
import { useEffect } from 'react'

import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export interface ModelCommandsProps {
  model: GraphModel
  onSelectNode: (nodeId: string) => void
}

export function ModelCommands({ model, onSelectNode }: ModelCommandsProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [matches, setMatches] = React.useState<GraphNode[]>([])

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

  useEffect(() => {
    // filter nodes based on search term
    if (searchTerm) {
      const searchResults = Array.from(model.nodes).filter((node) => {
        const name = node.getAttribute('name')?.value.literal.toLowerCase()
        return name && name.includes(searchTerm.toLowerCase())
      })
      setMatches(searchResults)
    } else {
      setMatches(Array.from(model.nodes))
    }
  }, [searchTerm, model.nodes])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleSelectNode = (nodeId: string | undefined) => {
    if (nodeId !== undefined) {
      onSelectNode(nodeId)
      setOpen(false)
    }
  }

  return (
    <>
      <div className="mt-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Press
          {' '}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>
            J
          </kbd>
          {' '}
          to search
        </p>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search nodes by name..."
          onInput={handleSearchChange}
          value={searchTerm}
        />
        <CommandList>
          <CommandGroup heading="Nodes">
            {matches.length === 0
              ? (
                <CommandEmpty>No results found.</CommandEmpty>
                )
              : (
                  matches.map((node) => (
                    <CommandItem
                      key={node.id}
                      onSelect={() => handleSelectNode(node.id)}
                    >
                      {node.getAttribute('name')?.value.literal}
                    </CommandItem>
                  ))
                )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
