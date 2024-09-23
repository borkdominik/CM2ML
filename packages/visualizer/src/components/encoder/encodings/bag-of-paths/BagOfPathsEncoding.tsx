import { BagOfPathsEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { ExecutionError } from '@cm2ml/plugin'
import { Fragment } from 'react'

import type { ParameterValues } from '../../../Parameters'
import { Hint } from '../../../ui/hint'
import { Separator } from '../../../ui/separator'
import { useEncoder } from '../../useEncoder'

import { PathGraph } from './PathGraph'

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

export function BagOfPathsEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(BagOfPathsEncoder, model, parameters)
  if (error || !encoding) {
    return <Hint error={error} />
  }
  if (encoding.data instanceof ExecutionError) {
    return <Hint error={encoding.data} />
  }
  const { paths, mapping } = encoding.data
  if (paths.length === 0) {
    return <Hint text="No paths found. Consider decreasing the minimum path length." />
  }
  return (
    <div className="flex h-full flex-col overflow-y-auto" data-testid="bag-of-paths-encoding">
      {paths.map((path, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={i}>
          {i > 0 ? <Separator /> : null}
          <PathGraph path={path} mapping={mapping} />
        </Fragment>
      ))}
    </div>
  )
}
