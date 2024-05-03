import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { getPluginsToTest } from './test-utils'

import { batchedPlugins } from './index'

const testCases = getPluginsToTest(batchedPlugins)

describe('batched plugins', () => {
  it.each(testCases)('%s', (_, plugin, inputDir, inputFiles) => {
    const input = inputFiles.map((inputFile) => readFileSync(`${inputDir}/${inputFile}`, 'utf-8'))
    const output = plugin.validateAndInvoke(input, {})
    expect(output).toMatchFileSnapshot(`./__snapshots__/${plugin.name}.txt`)
  })
})
