import { Crosshair2Icon } from '@radix-ui/react-icons'

import { Button } from './ui/button'

export interface Props {
  fit: () => void
}

export function FitButton({ fit }: Props) {
  return (
    <Button className="absolute right-2 top-2" variant="ghost" size="icon" onClick={fit}>
      <Crosshair2Icon />
    </Button>
  )
}
