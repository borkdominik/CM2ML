import type { ReactNode } from 'react'

export interface Props {
  children: ReactNode
}

export function Container({ children }: Props) {
  return <div className="rounded bg-neutral-100">{children}</div>
}
