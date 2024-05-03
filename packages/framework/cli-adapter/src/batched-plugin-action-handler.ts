import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

import type { ParameterMetadata, Plugin } from '@cm2ml/plugin'
import { METADATA_KEY } from '@cm2ml/plugin'
import { groupBatchedOutput } from '@cm2ml/plugin-adapter'

import { getResultAsText, normalizeOptions } from './utils'

export function batchedPluginActionHandler<Out, Parameters extends ParameterMetadata>(
  plugin: Plugin<string[], { data: Out[], [METADATA_KEY]: unknown }, Parameters>,
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
  const { results, errors, metadata } = groupBatchedOutput(output)

  const outDir = normalizedOptions.out
  const merge = typeof normalizedOptions.merge === 'boolean' ? normalizedOptions.merge : false

  if (!outDir) {
    if (merge) {
      const mergedOutput = Object.fromEntries(results.map(({ index, result }) => [inputFiles[index]!, result]))
      // eslint-disable-next-line no-console
      console.log(getResultAsText({ [METADATA_KEY]: metadata, data: mergedOutput }, normalizedOptions.pretty))
    } else {
      errors.forEach(({ error, index }) => {
        console.error(`\n${inputFiles[index]}:\n ${error.message}\n`)
      })
      results.forEach(({ result, index }) => {
        const resultText = getResultAsText(result, normalizedOptions.pretty)
        // eslint-disable-next-line no-console
        console.log(`\n${inputFiles[index]}:\n${resultText}\n`)
      })
      // eslint-disable-next-line no-console
      console.log('\nMetadata:\n', getResultAsText(metadata, normalizedOptions.pretty))
    }
    logBatchStatistics(errors.length, results.length, output.data.length)
    return
  }

  if (merge) {
    const mergedOutput = Object.fromEntries(results.map(({ index, result }) => [inputFiles[index]!, result]))
    const mergedResultText = getResultAsText({ [METADATA_KEY]: metadata, data: mergedOutput }, normalizedOptions.pretty)
    writeFileSync(outDir, mergedResultText)
    errors.forEach(({ error, index }) => {
      console.error(`\n${inputFiles[index]}:\n ${error.message}\n`)
    })
  } else {
    mkdirSync(outDir, { recursive: true })
    errors.forEach(({ error, index }) => {
      const inputFileName = inputFiles[index]
      if (!inputFileName) {
        throw new Error('Internal error. Input file is missing')
      }
      const errorFile = `${outDir}/${inputFileName}.${plugin.name}.error.txt`
      writeFileSync(errorFile, error.message)
    })
    results.forEach(({ result, index }) => {
      const inputFileName = inputFiles[index]
      if (!inputFileName) {
        throw new Error('Internal error. Input file is missing')
      }
      const outFile = `${outDir}/${inputFileName}.${plugin.name}.json`
      const resultText = getResultAsText(result, normalizedOptions.pretty)
      writeFileSync(outFile, resultText)
    })
    const metadataFile = `${outDir}/${plugin.name}.metadata.json`
    writeFileSync(metadataFile, getResultAsText(metadata, normalizedOptions.pretty))
  }
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
