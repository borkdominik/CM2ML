import { GraphEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import type { Plugin } from '@cm2ml/plugin'

import type { ParameterValues } from '../Parameters'
import { Hint } from '../ui/hint'

import { RawGraphEncoding } from './encodings/RawGraphEncoding'

export interface Props {
  encoder: Plugin<GraphModel, unknown, any>
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
