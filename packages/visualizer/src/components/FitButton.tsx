import { Crosshair2Icon } from '@radix-ui/react-icons'

import { Button } from './ui/button'

export interface Props {
  fit: () => void
  disabled?: boolean
  overlay?: boolean
}

export function FitButton({ fit, disabled = false, overlay = false }: Props) {
  const className = overlay ? 'absolute right-2 top-2' : 'size-4'
  return (
    <Button className={className} variant="ghost" size="icon" onClick={fit} disabled={disabled}>
      <Crosshair2Icon />
    </Button>
  )
}
