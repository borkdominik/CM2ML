import { GraphEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'

import type { ParameterValues } from '../../../Parameters'
import { Hint } from '../../../ui/hint'
import { useEncoder } from '../../useEncoder'

import { Grid } from './Grid'
import { SparseList } from './SparseList'

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

export function RawGraphEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(GraphEncoder, model, parameters)
  if (error || !encoding) {
    return <Hint error={error} />
  }
  if (encoding.format === 'list') {
    if (encoding.list.length === 0) {
      return <Hint text="No edges" />
    }
    return <SparseList list={encoding.list} nodes={encoding.nodes} nodeFeatures={encoding.nodeFeatures} nodeFeaturesVectors={encoding.nodeFeatureVectors} />
  }
  if (encoding.matrix.every((row) => row.every((weight) => weight === 0))) {
    return <Hint text="No edges" />
  }
  return (
    <div className="h-full p-2">
      <Grid matrix={encoding.matrix} nodes={encoding.nodes} />
    </div>
  )
}
