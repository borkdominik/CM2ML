import type { ParameterMetadata } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

export function getResultAsText(result: unknown, pretty: boolean | undefined): string {
  return typeof result === 'string' ? result : `${JSON.stringify(result, null, pretty ? 2 : undefined)}\n`
}

export function normalizeOptions(options: Record<string, unknown>, parameters: ParameterMetadata): Record<string, unknown> & { out?: string, pretty?: boolean } {
  return Stream.fromObject(options)
    .map(([name, parameter]) => {
      if (Array.isArray(parameter) && !parameters[name]?.type.startsWith('array<')) {
        return [name, parameter[0]]
      } else {
        return [name, parameter]
      }
    })
    .toRecord(
      ([name]) => name,
      ([_name, value]) => value,
    )
}