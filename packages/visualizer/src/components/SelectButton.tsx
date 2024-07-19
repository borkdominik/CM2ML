import type { Selection } from '../lib/useSelection'
import { useSelection } from '../lib/useSelection'

import { Button } from './ui/button'

export interface SelectButtonProps {
  selection: Selection
  text: string
  isSelected?: boolean
}

export function SelectButton({ isSelected = false, selection, text }: SelectButtonProps) {
  const setSelection = useSelection.use.setSelection()
  const color = isSelected ? 'text-primary' : 'text-secondary'
  return (
    <Button
      variant="link"
      className={`size-fit p-0 font-mono text-xs ${color}`}
      onClick={() => setSelection(selection)}
    >
      {text}
    </Button>
  )
}
