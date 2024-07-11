import { readFileSync, readdirSync, writeFileSync } from 'node:fs'

import type { ParameterMetadata, Plugin, StructuredOutput } from '@cm2ml/plugin'
import { groupStructuredOutput } from '@cm2ml/plugin-adapter'

import { getResultAsText, normalizeOptions } from './utils'

export function batchedPluginActionHandler<Parameters extends ParameterMetadata>(
  plugin: Plugin<string[], StructuredOutput<unknown[], unknown>, Parameters>,
  inputDir: string,
  options: Record<string, unknown>,
) {
  const normalizedOptions = normalizeOptions(options, plugin.parameters)

  const start = typeof normalizedOptions.start === 'number' ? normalizedOptions.start : 0
  const limit = typeof normalizedOptions.limit === 'number' ? normalizedOptions.limit : undefined
  const end = limit ? start + limit : undefined

  const inputFiles = readdirSync(inputDir, { encoding: 'utf8', withFileTypes: true }).filter((dirent) => dirent.isFile()).slice(start, end).map((dirent) => dirent.name)
  const input = inputFiles.map((inputFile) => readFileSync(`${inputDir}/${inputFile}`, 'utf8'))

  const output = plugin.validateAndInvoke(input, normalizedOptions)
  if (output.data.length !== input.length) {
    throw new Error(`Expected ${input.length} outputs, but got ${output.data.length}. This is an internal error.`)
  }
  const { results, errors, metadata } = groupStructuredOutput(output)

  const outFile = normalizedOptions.out

  if (!outFile) {
    const mergedOutput = Object.fromEntries(results.map(({ index, result }) => [inputFiles[index]!, result]))
    // eslint-disable-next-line no-console
    console.log(getResultAsText({ metadata, data: mergedOutput }, normalizedOptions.pretty))
    logBatchStatistics(errors.length, results.length, output.data.length)
    return
  }

  const mergedOutput = Object.fromEntries(results.map(({ index, result }) => [inputFiles[index]!, result]))
  const mergedResultText = getResultAsText({ metadata, data: mergedOutput }, normalizedOptions.pretty)
  writeFileSync(outFile, mergedResultText)
  errors.forEach(({ error, index }) => {
    console.error(`\n${inputFiles[index]}:\n ${error.message}\n`)
  })
  logBatchStatistics(errors.length, results.length, output.data.length)
}

function logBatchStatistics(errors: number, success: number, total: number) {
  if (errors > 0) {
    console.error(`\nFailed to process ${errors}/${total} inputs.`)
  } else {
    // eslint-disable-next-line no-console
    console.log(`\nSuccessfully processed ${success}/${total} inputs.`)
  }
}
