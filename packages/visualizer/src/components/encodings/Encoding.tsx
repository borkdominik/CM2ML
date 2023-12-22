import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { GraphModel } from '@cm2ml/ir'
import type { Plugin } from '@cm2ml/plugin'

import { RawGraphEncoding } from './RawGraphEncoding'

export interface Props {
  encoder: Plugin<GraphModel, unknown, any>
  model: GraphModel
}

export function Encoding({ encoder, model }: Props) {
  if (encoder === GraphEncoder) {
    return <RawGraphEncoding model={model} />
  }
  return <div>Unsupported encoder</div>
}
