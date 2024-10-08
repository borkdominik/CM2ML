import { getTypeConstructor, type ParameterMetadata } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { loadFromFile } from './plugin-action-handler'

export function getResultAsText(result: unknown, pretty: boolean | undefined): string {
  return typeof result === 'string' ? result : `${JSON.stringify(result, null, pretty ? 2 : undefined)}\n`
}

export function normalizeOptions(options: Record<string, unknown>, parameters: ParameterMetadata): Record<string, unknown> & { out?: string, pretty?: boolean } {
  return Stream.fromObject(options)
    .map(([name, parameter]) => {
      const parameterType = parameters[name]?.type
      const isMultiValuedParameter = parameterType?.startsWith('list<') || parameterType?.startsWith('set<')
      if (Array.isArray(parameter) && !isMultiValuedParameter) {
        // Use first occurrence of duplicate non-array parameters
        return [name, parameter[0]]
      } else if (!Array.isArray(parameter) && isMultiValuedParameter) {
        // Wrap single-valued array parameters
        return [name, [parameter]]
      } else {
        return [name, parameter]
      }
    })
    .map(([name, value]) => {
      if (!Array.isArray(value)) {
        return [name, value]
      }
      const typeConstructor = getTypeConstructor(parameters[name]!.type)
      const typedValue = typeConstructor(value)
      const parameter = parameters[name]!
      const processFile = 'processFile' in parameter ? parameter.processFile : undefined
      if (!processFile) {
        return [name, typedValue]
      }
      return [name, (typedValue as string[]).map((file) => loadFromFile(file, processFile))]
    })
    .toRecord(
      ([name]) => name,
      ([_name, value]) => value,
    )
}
