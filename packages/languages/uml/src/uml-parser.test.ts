import { readFileSync, readdirSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { UmlParser } from './index'

const numberOfDatasetFiles = 6

const configurations: {
  onlyContainmentAssociations: boolean
  relationshipsAsEdges: boolean
}[] = [
  {
    onlyContainmentAssociations: false,
    relationshipsAsEdges: false,
  },
  {
    onlyContainmentAssociations: true,
    relationshipsAsEdges: false,
  },
  {
    onlyContainmentAssociations: false,
    relationshipsAsEdges: true,
  },
  {
    onlyContainmentAssociations: true,
    relationshipsAsEdges: true,
  },
]

const override = undefined // '../../../models/uml/dataset/0023848af9cdebffab9a02171ebe4b842a23a23392cda9222913f9dbe5f44778.uml'
const files = getFiles(override)

describe('uml-parser', () => {
  describe.each(configurations)('with configuration %j', (configuration) => {
    it.each(files)('should parse %s', (file) => {
      const serializedModel = readFileSync(file, 'utf-8')
      try {
        const result = UmlParser.invoke(serializedModel, { ...configuration, debug: false, removeInvalidNodes: false, strict: true })
        expect(result).toBeDefined()
        if (override) {
          // eslint-disable-next-line no-console
          console.info(result.show())
        }
      } catch (error) {
        if (override) {
          // eslint-disable-next-line no-console
          console.info(serializedModel)
        }
        throw error
      }
    })
  })
})

function getFiles(override?: string) {
  if (override) {
    return [override]
  }
  const umlModelDir = '../../../models/uml'
  const datasetDir = `${umlModelDir}/dataset`

  const files = readdirSync(umlModelDir).filter((file) => file.endsWith('.uml')).map((file) => `${umlModelDir}/${file}`)
  const datasetFiles = readdirSync(datasetDir).filter((file) => file.endsWith('.uml')).splice(0, numberOfDatasetFiles).map((file) => `${datasetDir}/${file}`)
  files.push(...datasetFiles)
  return files
}
