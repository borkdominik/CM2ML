import type { GraphModel } from '@cm2ml/ir'
import type { Plugin } from '@cm2ml/plugin'
import { getMessage } from '@cm2ml/utils'
import { useMemo } from 'react'

import type { ParameterValues } from '../components/Parameters'

export type Parser = Plugin<string, GraphModel, any>

export function useModelParser(
  parser: Parser | undefined,
  serializedModel: string | undefined,
  parameters: ParameterValues,
) {
  const result = useMemo(() => {
    if (!serializedModel || !parser) {
      return {}
    }
    try {
      const model = parser.invoke(serializedModel, parameters)
      return { model }
    } catch (error) {
      return { error: getMessage(error) }
    }
  }, [serializedModel, parameters, parser])
  return result
}
