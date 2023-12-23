import { UmlParser } from '@cm2ml/uml-parser'
import { getMessage } from '@cm2ml/utils'
import { useMemo } from 'react'

// TODO: Make parser selectable
export function useModelParser(serializedModel: string | undefined) {
  const result = useMemo(() => {
    if (!serializedModel) {
      return {}
    }
    try {
      const model = UmlParser.invoke(serializedModel, {
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
