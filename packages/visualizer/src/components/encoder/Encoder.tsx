import { useEncoderState } from '../../lib/useEncoderState'
import { useModelState } from '../../lib/useModelState'
import { Error } from '../Error'

import { Encoding } from './Encoding'

export function Encoder() {
  const { model } = useModelState()
  const { encoder, parameters } = useEncoderState()

  if (!encoder) {
    return null
  }

  if (!model) {
    return (
      <div className="flex h-full items-center justify-center">
        <Error error="No model loaded" />
      </div>
    )
  }

  return <Encoding model={model} encoder={encoder} parameters={parameters} />
}
