import type { Encoder } from '@cm2ml/builtin'
import { GraphEncoder, PatternMiner, TreeEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'

import type { ParameterValues } from '../Parameters'
import { Hint } from '../ui/hint'

import { PatternEncoding } from './encodings/pattern/PatternEncoding'
import { RawGraphEncoding } from './encodings/raw-graph/RawGraphEncoding'
import { TreeEncoding } from './encodings/tree/TreeEncoding'

export interface Props {
  encoder: Encoder
  model: GraphModel
  parameters: ParameterValues
}

export function Encoding({ encoder, model, parameters }: Props) {
  if (encoder === GraphEncoder) {
    return <RawGraphEncoding model={model} parameters={parameters} />
  }
  if (encoder === PatternMiner) {
    return <PatternEncoding model={model} parameters={parameters} />
  }
  if (encoder === TreeEncoder) {
    return <TreeEncoding model={model} parameters={parameters} />
  }
  return (
    <Hint error={`No visualization for ${encoder.name} encoding available`} />
  )
}
