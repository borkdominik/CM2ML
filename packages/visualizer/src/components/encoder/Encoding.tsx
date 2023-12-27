import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { GraphModel } from '@cm2ml/ir'
import type { Plugin } from '@cm2ml/plugin'

import { Error } from '../Error'
import type { ParameterValues } from '../Parameters'

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
    <div className="flex h-full items-center justify-center">
      <Error error={`No visualization for ${encoder.name} available`} />
    </div>
  )
}