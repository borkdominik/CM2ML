import type { Encoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { json } from '@codemirror/lang-json'
import CodeMirror from '@uiw/react-codemirror'
import { useMemo } from 'react'

import { prettifyEncoderName } from '../../lib/pluginNames'
import { useTheme } from '../../lib/useTheme'
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
  const theme = useTheme.use.theme()
  if (error !== undefined) {
    return <Hint error={error} />
  }
  return (
    <div className="flex h-full flex-col">
      <div>
        <Hint error={`No visualization for ${prettifyEncoderName(encoder.name)} available.`} />
      </div>
      <Separator />
      <div className="grow overflow-auto">
        <CodeMirror
          value={formattedOutput}
          theme={theme}
          readOnly
          extensions={[json()]}
        />
      </div>
    </div>
  )
}
