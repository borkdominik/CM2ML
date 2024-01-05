import { useEncoderState } from '../../lib/useEncoderState'
import { useModelState } from '../../lib/useModelState'
import { Hint } from '../ui/hint'

import { Encoding } from './Encoding'

export function Encoder() {
  const model = useModelState.use.model()
  const encoder = useEncoderState.use.encoder()
  const parameters = useEncoderState.use.parameters()

  if (!encoder) {
    return <Hint text="No encoder" />
  }

  if (!model) {
    return <Hint text="No model to encode" error />
  }

  return <Encoding model={model} encoder={encoder} parameters={parameters} />
}
