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
  const { data } = encoding
  if (data.format === 'list') {
    if (data.list.length === 0) {
      return <Hint text="No edges" />
    }
    return <SparseList {...data} {...encoding.metadata} />
  }
  if (data.matrix.every((row) => row.every((weight) => weight === 0))) {
    return <Hint text="No edges" />
  }
  return (
    <div className="h-full p-2">
      <Grid matrix={data.matrix} nodes={data.nodes} />
    </div>
  )
}
