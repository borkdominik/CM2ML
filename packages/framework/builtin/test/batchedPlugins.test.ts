import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { plugins } from '../src/index'

import { getPluginsToTest } from './test-utils'

const testCases = getPluginsToTest(plugins)

describe('batched plugins', () => {
  it.each(testCases)('%s', async (_, plugin, inputDir, inputFiles) => {
    const input = inputFiles.map((inputFile) => readFileSync(`${inputDir}/${inputFile}`, 'utf-8'))
    const output = plugin.validateAndInvoke(input, {})
    await expect(output).toMatchFileSnapshot(`./__snapshots__/${plugin.name}/batched-${plugin.name}.txt`)
  })
})
