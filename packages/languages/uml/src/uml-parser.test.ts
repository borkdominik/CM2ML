import { readFileSync, readdirSync } from 'node:fs'

import { getMessage } from '@cm2ml/utils'
import { describe, expect, it } from 'vitest'

import { UmlParser } from './index'

// Green: 0-799

const { validModels, invalidModels } = getFiles({
  startIndex: 0,
  numberOfFiles: 800,
  invalidModels: [
    '02ae79e9252059b1b9dda7355154f6631edc2bc7499d4a6ccd45621d4cffcd09.uml', // invalid "input" and "output" attributes on uml:Operation
    '0390aa780981baeb9c88926789a9a864e3dbae961118a2f17f3a87a0cc3bb493.uml', // duplicate id
  ],
  // override: 799,
})

const showDebugOutput = validModels.length === 1

describe('uml-parser', () => {
  describe.each(getConfigurations())('with configuration $name', (configuration) => {
    it.each(validModels)('should parse model $index: $file', ({ file }) => {
      const serializedModel = readFileSync(file, 'utf-8')
      try {
        const result = UmlParser.invoke(serializedModel, { ...configuration, debug: true, removeInvalidNodes: false, strict: true })
        expect(result).toBeDefined()
        if (showDebugOutput) {
          // eslint-disable-next-line no-console
          console.info(result.show())
        }
      } catch (error) {
        if (showDebugOutput) {
          // eslint-disable-next-line no-console
          console.info(serializedModel)
        }
        throw new Error(`Failed to parse model ${file}: ${getMessage(error)}`)
      }
    })

    it.skipIf(showDebugOutput).each(invalidModels)('should not parse model %s', (file) => {
      const serializedModel = readFileSync(file, 'utf-8')
      try {
        UmlParser.invoke(serializedModel, { ...configuration, debug: true, removeInvalidNodes: false, strict: true })
        throw new Error(`Model ${file} was parsed successfully but should not have been.`)
      } catch (error) {
      }
    })
  })
})

function getFiles({ startIndex = 0, numberOfFiles, invalidModels = [], override }: { startIndex?: number, numberOfFiles?: number, override?: number, invalidModels?: string[] }) {
  const invalidModelSet = new Set(invalidModels)
  const umlModelDir = '../../../models/uml'
  const datasetDir = `${umlModelDir}/dataset`
  const preparedFiles = readdirSync(umlModelDir).filter((file) => file.endsWith('.uml')).map((file) => `${umlModelDir}/${file}`)
  const datasetFiles = readdirSync(datasetDir).filter((file) => file.endsWith('.uml'))
  const validDatasetFiles = datasetFiles.filter((file) => !invalidModelSet.has(file)).map((file) => `${datasetDir}/${file}`)
  const invalidDatasetFiles = readdirSync(datasetDir).filter((file) => invalidModelSet.has(file)).map((file) => `${datasetDir}/${file}`)
  const allValidFiles = preparedFiles.concat(validDatasetFiles).map((file, index) => ({ file, index }))
  if (override && override >= 0 && override < allValidFiles.length) {
    return { validModels: [allValidFiles[override]!], invalidModels: invalidDatasetFiles }
  }
  const actualStartIndex = process.env.COVERAGE ? 0 : startIndex
  return { validModels: allValidFiles.slice(actualStartIndex, numberOfFiles ? actualStartIndex + numberOfFiles : undefined), invalidModels: invalidDatasetFiles }
}

function getConfigurations(pick?: 0 | 1 | 2 | 3) {
  const configurationPresets = [
    {
      name: 'default',
      onlyContainmentAssociations: false,
      relationshipsAsEdges: false,
    },
    {
      name: 'only containment associations',
      onlyContainmentAssociations: true,
      relationshipsAsEdges: false,
    },
    {
      name: 'relationships as edges',
      onlyContainmentAssociations: false,
      relationshipsAsEdges: true,
    },
    {
      name: 'only containment associations and relationships as edges',
      onlyContainmentAssociations: true,
      relationshipsAsEdges: true,
    },
  ] as const satisfies {
    name: string
    onlyContainmentAssociations: boolean
    relationshipsAsEdges: boolean
  }[]
  if (pick !== undefined) {
    return [configurationPresets[pick]]
  }
  return configurationPresets
}
