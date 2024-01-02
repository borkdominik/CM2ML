import { useEncoderState } from '../../lib/useEncoderState'
import { useModelState } from '../../lib/useModelState'
import { Error } from '../Error'

import { EncoderForm } from './EncoderForm'
import { Encoding } from './Encoding'

export function Encoder() {
  const { model } = useModelState()
  const { encoder, parameters } = useEncoderState()
  if (encoder && model) {
    return <Encoding model={model} encoder={encoder} parameters={parameters} />
  }
  if (encoder) {
    return (
      <div className="flex h-full items-center justify-center">
        <Error error="No model loaded" />
      </div>
    )
  }
  return (
    <div className="h-full p-2">
      <EncoderForm />
    </div>
  )
}
