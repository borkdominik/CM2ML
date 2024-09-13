import type { Encoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { useMemo } from 'react'

import { prettifyEncoderName } from '../../lib/pluginNames'
import type { ParameterValues } from '../Parameters'
import { Hint } from '../ui/hint'
import { Separator } from '../ui/separator'

import { useEncoder } from './useEncoder'

export interface Props {
  encoder: Encoder
  model: GraphModel
  parameters: ParameterValues
}

export function EncodingFallback({ encoder, model, parameters }: Props) {
  const { encoding, error } = useEncoder(encoder, model, parameters)
  const formattedOutput = useMemo(() => JSON.stringify(encoding, null, 2), [encoding])
  if (error !== undefined) {
    return <Hint error={error} />
  }
  return (
    <div className="flex h-full flex-col">
      <Hint error={`No visualization for ${prettifyEncoderName(encoder.name)} available.`} />
      <Separator />
      <pre className="grow overflow-auto p-2 text-xs">
        {formattedOutput}
      </pre>
    </div>
  )
}
