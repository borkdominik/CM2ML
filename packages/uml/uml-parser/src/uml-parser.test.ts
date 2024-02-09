import { readFileSync, readdirSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { UmlParser } from './index'

const datasetDir = '../../../models/uml/dataset'
const filesToRead = 1

const files = readdirSync(datasetDir).filter((file) => file.endsWith('.uml')).splice(0, filesToRead)

describe('uml-parser', () => {
  it.fails.each(files)('should parse %s', (file) => {
    const serializedModel = readFileSync(`${datasetDir}/${file}`, 'utf-8')
    const result = UmlParser.invoke(serializedModel, {
      strict: true,
      onlyContainmentAssociations: false,
      relationshipsAsEdges: false,
      removeInvalidNodes: false,
      debug: true,
    })
    expect(result).toBeDefined()
  })
})
