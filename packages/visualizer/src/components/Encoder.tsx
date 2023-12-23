import { useAppState } from '../lib/useAppState'

import { EncoderForm } from './EncoderForm'
import { Encoding } from './encodings/Encoding'

export function Encoder() {
  const { encoder, model } = useAppState()
  if (encoder && model) {
    return <Encoding model={model} encoder={encoder} />
  }
  if (encoder) {
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        No model loaded
      </div>
    )
  }
  return (
    <div className="p-2">
      <EncoderForm />
    </div>
  )
}
