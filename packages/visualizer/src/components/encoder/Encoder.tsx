import { useEncoderState } from '../../lib/useEncoderState'
import { useModelState } from '../../lib/useModelState'
import { Error } from '../Error'

import { Encoding } from './Encoding'

export function Encoder() {
  const model = useModelState.use.model()
  const encoder = useEncoderState.use.encoder()
  const parameters = useEncoderState.use.parameters()

  if (!encoder) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-xs text-muted-foreground">No encoder</span>
      </div>
    )
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
