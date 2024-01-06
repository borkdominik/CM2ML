import { Error } from '../Error'

import { Center } from './center'

export type Props =
  | { error?: never; text: string }
  | {
      error: unknown
      text?: never
    }

export function Hint({ error, text }: Props) {
  if (error) {
    return (
      <Center>
        <div className="p-2">
          <Error error={error} />
        </div>
      </Center>
    )
  }
  return (
    <Center>
      <span className="select-none text-balance px-3 py-1 text-xs text-muted-foreground">
        {text}
      </span>
    </Center>
  )
}
