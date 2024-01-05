import { Error } from '../Error'

import { Center } from './center'

export interface Props {
  text: string
  error?: boolean
}

export function Hint({ error = false, text }: Props) {
  return (
    <Center>
      {error ? (
        <Error error={text} />
      ) : (
        <span className="text-xs text-muted-foreground">{text}</span>
      )}
    </Center>
  )
}
