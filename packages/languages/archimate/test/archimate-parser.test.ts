import { readFileSync, readdirSync } from 'node:fs'

import { getMessage } from '@cm2ml/utils'
import { describe, expect, it } from 'vitest'

import { ArchimateParser } from '../src/index'

const datasetDir = `${import.meta.dirname}/../../../../models/archimate/dataset`
const excludedModels = new Set([
  'id-a38bdc19622f419196e1f096879b2a00.archimate', // duplicate ID (view)
  'id-a38bdc19622f419196e1f096879b2a00.xml',
  'id-ceae47297ac048f6965cf594e1e7f7f4.archimate', // duplicate ID (view)
  'id-ceae47297ac048f6965cf594e1e7f7f4.xml',
  '_9otEEKbNEeqEM7mFKilpXw.xml', // duplicate ID
  'id-ec8a8e99.xml', // duplicate ID
  'id-45a9ac5f.xml', // TODO: no <diagrams> element for views
  'id-ee2bba95.xml', // same as above
  'id-43a1bdf8-2694-4d8b-934d-718f7f69e9b2.xml', // TODO: multiple <name> elements (with different language)
  'id-807a14ad-df37-4954-9e8e-0fa5c04a24dc.xml', // same as above
])

// 1) *.archimate models (Archi Format):
// Models:      952
// Tests:       3808 passed
// Duration:    44.55s
const archiFormatModels = getFiles('.archimate')
// const archiFormatModels = getFiles('.archimate', { start: 0, end: 100 });

// 2) *.xml models (Open Group Formats):
// Models:      968
// Tests:       3872 passed
// Duration     101.09s
const opengroupFormatModels = getFiles('.xml')
// const opengroupFormatModels = getFiles('.xml', { start: 0, end: 100 });

const allModels = archiFormatModels.concat(...opengroupFormatModels)

describe('archimate-parser', () => {
  describe.each(getConfigurations())('with configuration $name', (config) => {
    it.each(allModels)('should parse model %#', (file) => {
      const serializedModel = readFileSync(file, 'utf-8')
      try {
        const result = ArchimateParser.validateAndInvoke(serializedModel, { ...config, debug: true, strict: true })
        expect(result).toBeDefined()
      } catch (err) {
        throw new Error(`Failed to parse model ${file}: ${getMessage(err)}`)
      }
    })
  })
})

function getFiles(fileExtension: '.archimate' | '.xml', options?: { start: number, end: number }) {
  const modelDir = fileExtension === '.archimate' ? `${datasetDir}/archi-format` : `${datasetDir}/opengroup-format`
  const datasetFiles = readdirSync(modelDir)
    .filter((file) => file.endsWith(fileExtension))
    .filter((file) => !excludedModels.has(file))
    .map((file) => `${modelDir}/${file}`)
  if (options) {
    return datasetFiles.slice(options.start, options.end)
  }
  return datasetFiles
}

function getConfigurations(pick?: 0 | 1 | 2 | 3) {
  const presets = [
    {
      name: 'default',
      relationshipsAsNodes: false,
      viewsAsNodes: false,
    },
    {
      name: 'relationships as nodes',
      relationshipsAsNodes: true,
      viewsAsNodes: false,
    },
    {
      name: 'views as nodes',
      relationshipsAsNodes: false,
      viewsAsNodes: true,
    },
    {
      name: 'relationships as nodes and views as nodes',
      relationshipsAsNodes: true,
      viewsAsNodes: true,
    },
  ] as const satisfies {
    name: string
    relationshipsAsNodes: boolean
    viewsAsNodes: boolean
  }[]
  if (pick !== undefined) {
    return [presets[pick]]
  }
  return presets
}
