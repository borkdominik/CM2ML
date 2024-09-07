import { getMessage } from '@cm2ml/utils'

export function Error({ error }: { error: unknown }) {
  const message = getMessage(error)
  return (
    <div className="border-input bg-destructive text-destructive-foreground flex items-center whitespace-pre text-balance rounded-md border px-3 py-1 text-xs">
      {message}
    </div>
  )
}
