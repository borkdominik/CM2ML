import type { Encoder } from '@cm2ml/builtin'
import { GraphEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'

import type { ParameterValues } from '../Parameters'
import { Hint } from '../ui/hint'

import { RawGraphEncoding } from './encodings/raw-graph/RawGraphEncoding'

export interface Props {
  encoder: Encoder
  model: GraphModel
  parameters: ParameterValues
}

export function Encoding({ encoder, model, parameters }: Props) {
  if (encoder === GraphEncoder) {
    return <RawGraphEncoding model={model} parameters={parameters} />
  }
  return (
    <Hint error={`No visualization for ${encoder.name} encoding available`} />
  )
}
