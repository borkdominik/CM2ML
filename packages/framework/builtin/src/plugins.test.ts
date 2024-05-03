import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { getPluginsToTest } from './test-utils'

import { plugins } from './index'

const testCases = getPluginsToTest(plugins)

describe('plugins', () => {
  describe.each(testCases)('%s', (_, plugin, inputDir, inputFiles) => {
    it.each(inputFiles)('parses %s', (inputFile) => {
      const input = readFileSync(`${inputDir}/${inputFile}`, 'utf-8')
      const output = plugin.validateAndInvoke(input, {})
      expect(output).toMatchFileSnapshot(`./__snapshots__/${plugin.name}/${inputFile}.txt`)
    })
  })
})
