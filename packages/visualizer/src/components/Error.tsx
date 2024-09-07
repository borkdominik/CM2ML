import { getMessage } from '@cm2ml/utils'

export function Error({ error }: { error: unknown }) {
  const message = getMessage(error)
  return (
    <div className="flex items-center whitespace-pre text-balance rounded-md border border-input bg-destructive px-3 py-1 font-mono text-xs text-destructive-foreground">
      {message}
    </div>
  )
}
