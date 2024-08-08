import type { FeatureContext, FeatureVector, PathData } from '@cm2ml/builtin'
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
  const { paths, nodes, mapping } = encoding.data
  if (paths.length === 0) {
    return <Hint text="No paths found. Consider decreasing the minimum path length." />
  }
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {paths.map((path, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={i}>
          {i > 0 ? <Separator /> : null}
          <Path path={path} nodes={nodes} mapping={mapping} metadata={encoding.metadata} />
        </Fragment>
      ))}
    </div>
  )
}

interface PathProps {
  path: PathData
  nodes: FeatureVector[]
  mapping: string[]
  metadata: PathMetadata
}

function Path({ path, mapping }: PathProps) {
  // Use a fragment as the root to put both the list and the graph into the same container
  // This way, the graph can be sized independently of the list
  return (
    <>
      <div className="bg-muted p-2">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>
            {`Weight: ${path.weight}`}
          </span>
        </div>
      </div>
      <Separator />
      <PathGraph path={path} mapping={mapping} />
    </>
  )
}

export interface PathMetadata {
  nodeFeatures: FeatureContext['nodeFeatures']
  edgeFeatures: FeatureContext['edgeFeatures']
  idAttribute: string
  typeAttributes: string[]
}
