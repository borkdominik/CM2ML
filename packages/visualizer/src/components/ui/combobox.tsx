import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import { cn } from '../../lib/utils'

import { Button } from './button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export interface ComboboxOptions {
  label: string
  value: string
}

export type ComboboxProps = {
  options: ComboboxOptions[]
} & ({
  externalValue?: never
  onSelect: (value: string) => void
} | {
  /**
   * If provided, the combobox will use this state.
   * Otherwise, it will manage its own state and clear the value immediately after selection.
   */
  externalValue?: [string, (value: string) => void]
  onSelect?: never
})

export function Combobox({ externalValue, onSelect, options }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = externalValue ?? []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {value
            ? options.find((options) => options.value === value)?.label
            : 'Select...'}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No result.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(newValue) => {
                    setOpen(false)
                    if (newValue === value) {
                      return
                    }
                    setValue?.(newValue)
                    onSelect?.(newValue)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
