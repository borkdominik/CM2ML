import type { Encoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { useMemo } from 'react'

import type { ParameterValues } from '../Parameters'

export function useEncoder<Encoding>(encoder: Encoder<Encoding>, model: GraphModel, parameters: ParameterValues) {
  return useMemo(() => {
    try {
      return { encoding: encoder.validateAndInvoke(model, parameters) }
    } catch (error) {
      return { error }
    }
  }, [encoder, model, parameters])
}
