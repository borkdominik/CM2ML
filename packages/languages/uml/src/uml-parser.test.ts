import { readFileSync, readdirSync } from 'node:fs'

import { getMessage } from '@cm2ml/utils'
import { describe, expect, it } from 'vitest'

import { UmlParser } from './index'

// Green: 0-4999

const { validModels, invalidModels } = getFiles({
  startIndex: 0,
  numberOfFiles: 5000,
  invalidModels: [
    '02ae79e9252059b1b9dda7355154f6631edc2bc7499d4a6ccd45621d4cffcd09.uml', // invalid "input" and "output" attributes on uml:Operation
    '0390aa780981baeb9c88926789a9a864e3dbae961118a2f17f3a87a0cc3bb493.uml', // duplicate id
    '086943006eec3dd2a28d9d053703ea1faf80f8aacdef0b993bb213ea3c38d304.uml', // uses abstract class Pin as instance type TODO/Jan: Check if abstract instances are allowed
    '0d5912ac87d1559fed1297cffbb53ebb6393878e4829bb85e64b50ff894e020a.uml', // duplicate id
    '1128005f61433c19ddb913f1716cb2165edfc973d455a3152fa2190b12b5f9f9.uml', // duplicate id
    '144edeee405de226d7726cd793d36383f895cf5f5950067c79ae98ef8bd25d6d.uml', // invalid "ownedTrigger" elements
    '1831658a2d93946723191887f0b2f33eb2cc05700b7cc45c9605a188a5b7478c.uml', // duplicate id
    '1a29a93587fccaa56c6e2747928bd4f9a83ea4fe94e51f9ed746e79718772d10.uml', // duplicate id
  ],
  // override: 3127,
})

const showDebugOutput = validModels.length === 1

describe('uml-parser', () => {
  describe.each(getConfigurations())('with configuration $name', (configuration) => {
    it.each(validModels)('should parse model $index', ({ file }) => {
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
        if (showDebugOutput) {
          throw new Error(`Failed to parse model ${file}: ${getMessage(error)}`)
        } else {
          throw error
        }
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
