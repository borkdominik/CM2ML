import type { Encoder } from '@cm2ml/builtin'
import { BagOfPathsEncoder, GraphEncoder, PatternMiner, TermFrequencyEncoder, TreeEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'

import type { ParameterValues } from '../Parameters'

import { EncodingFallback } from './EncodingFallback'
import { BagOfPathsEncoding } from './encodings/bag-of-paths/BagOfPathsEncoding'
import { PatternEncoding } from './encodings/pattern/PatternEncoding'
import { RawGraphEncoding } from './encodings/raw-graph/RawGraphEncoding'
import { TermFrequencyEncoding } from './encodings/terms/TermFrequencyEncoding'
import { TreeEncoding } from './encodings/tree/TreeEncoding'

export interface Props {
  encoder: Encoder
  model: GraphModel
  parameters: ParameterValues
}

export function Encoding({ encoder, model, parameters }: Props) {
  if (encoder === BagOfPathsEncoder) {
    return <BagOfPathsEncoding model={model} parameters={parameters} />
  }
  if (encoder === GraphEncoder) {
    return <RawGraphEncoding model={model} parameters={parameters} />
  }
  if (encoder === PatternMiner) {
    return <PatternEncoding model={model} parameters={parameters} />
  }
  if (encoder === TreeEncoder) {
    return <TreeEncoding model={model} parameters={parameters} />
  }
  if (encoder === TermFrequencyEncoder) {
    return <TermFrequencyEncoding model={model} parameters={parameters} />
  }
  return <EncodingFallback encoder={encoder} model={model} parameters={parameters} />
}
