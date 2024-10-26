import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import type { ParameterMetadata, Plugin, StructuredOutput } from '@cm2ml/plugin'

import { getResultAsText, normalizeOptions } from './utils'

export function pluginActionHandler<Parameters extends ParameterMetadata>(
  plugin: Plugin<string[], StructuredOutput<unknown[], unknown>, Parameters>,
  inputFile: string,
  options: Record<string, unknown>,
) {
  const normalizedOptions = normalizeOptions(options, plugin.parameters)
  const input = readFileSync(inputFile, 'utf8')
  const result = plugin.validateAndInvoke([input], normalizedOptions)
  const resultText = getResultAsText({ data: result.data[0], metadata: result.metadata }, normalizedOptions.pretty)

  const outFile = normalizedOptions.out
  if (!outFile) {
    // eslint-disable-next-line no-console
    console.log(resultText)
    return
  }

  mkdirSync(path.dirname(outFile), { recursive: true })
  writeFileSync(outFile, resultText)
}
