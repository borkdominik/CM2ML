import { readFileSync, readdirSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { UmlParser } from './index'

const umlModelDir = '../../../models/uml'
const datasetDir = `${umlModelDir}/dataset`
const numberOfDatasetFiles = 1

const files = readdirSync(umlModelDir).filter((file) => file.endsWith('.uml')).map((file) => `${umlModelDir}/${file}`)
const datasetFiles = readdirSync(datasetDir).filter((file) => file.endsWith('.uml')).splice(0, numberOfDatasetFiles).map((file) => `${datasetDir}/${file}`)
files.push(...datasetFiles)

const override = undefined // '../../../models/uml/dataset/00000a1a1995c7c777870d14d51ad42d88dd147c5ddcc4a9d5b5438fdf1f0b16.uml'

describe('uml-parser', () => {
  it.each(override ? [override] : files)('should parse %s', (file) => {
    const serializedModel = readFileSync(file, 'utf-8')
    try {
      const result = UmlParser.invoke(serializedModel, {
        strict: true,
        onlyContainmentAssociations: false,
        relationshipsAsEdges: false,
        removeInvalidNodes: false,
        debug: false,
      })
      expect(result).toBeDefined()
    } catch (error) {
      if (override) {
        // eslint-disable-next-line no-console
        console.info(serializedModel)
      }
      throw error
    }
  })
})
