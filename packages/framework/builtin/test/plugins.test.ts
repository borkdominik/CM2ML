import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { plugins } from '../src/index'

import { getPluginsToTest } from './test-utils'

const testCases = getPluginsToTest(plugins)

describe('plugins', () => {
  describe.each(testCases)('%s', (_, plugin, inputDir, inputFiles) => {
    it.each(inputFiles)('parses %s', async (inputFile) => {
      const input = readFileSync(`${inputDir}/${inputFile}`, 'utf-8')
      const output = plugin.validateAndInvoke([input], {})
      await expect(output).toMatchFileSnapshot(`./__snapshots__/${plugin.name}/${inputFile}.txt`)
    })
  })
})
