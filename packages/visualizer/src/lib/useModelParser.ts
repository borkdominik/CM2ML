import type { GraphModel } from '@cm2ml/ir'
import type { Plugin } from '@cm2ml/plugin'
import { getMessage } from '@cm2ml/utils'
import { useMemo } from 'react'

export type Parser = Plugin<string, GraphModel, any>

export function useModelParser(
  serializedModel: string | undefined,
  parser: Parser | undefined,
) {
  const result = useMemo(() => {
    if (!serializedModel || !parser) {
      return {}
    }
    try {
      const model = parser.invoke(serializedModel, {
        debug: false,
        idAttribute: 'id',
        strict: true,
      })
      return { model }
    } catch (error) {
      return { error: getMessage(error) }
    }
  }, [serializedModel])
  return result
}
