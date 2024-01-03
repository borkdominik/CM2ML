import { getMessage } from '@cm2ml/utils'

export function Error({ error }: { error: unknown }) {
  const message = getMessage(error)
  return (
    <div className="flex items-center rounded-md border border-input bg-destructive px-3 py-1 text-sm text-destructive-foreground">
      {message}
    </div>
  )
}
