import type { Encoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { ExecutionError } from '@cm2ml/plugin'
import { useMemo } from 'react'

import type { ParameterValues } from '../Parameters'

export function useEncoder<Data, Metadata>(encoder: Encoder<Data, Metadata>, model: GraphModel, parameters: ParameterValues) {
  return useMemo(() => {
    try {
      const [result] = encoder.validateAndInvoke([model], parameters)
      if (!result) {
        return { error: 'No result. This is an internal error.' }
      }
      if (result instanceof ExecutionError) {
        return { error: result }
      }
      return { encoding: result }
    } catch (error) {
      return { error }
    }
  }, [encoder, model, parameters])
}
