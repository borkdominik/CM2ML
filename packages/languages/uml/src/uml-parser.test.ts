import { readFileSync, readdirSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { UmlParser } from './index'

// Green: 0-599

const files = getFiles({
  startIndex: 500,
  numberOfFiles: 100,
  // override: 575,
})

const showDebugOutput = files.length === 1

describe('uml-parser', () => {
  describe.each(getConfigurations(0))('with configuration $name', (configuration) => {
    it.each(files)('should parse model $index', ({ file }) => {
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
        throw error
      }
    })
  })
})

function getFiles({ startIndex = 0, numberOfFiles, override }: { startIndex?: number, numberOfFiles?: number, override?: number }) {
  const umlModelDir = '../../../models/uml'
  const datasetDir = `${umlModelDir}/dataset`
  const preparedFiles = readdirSync(umlModelDir).filter((file) => file.endsWith('.uml')).map((file) => `${umlModelDir}/${file}`)
  const datasetFiles = readdirSync(datasetDir).filter((file) => file.endsWith('.uml')).map((file) => `${datasetDir}/${file}`)
  const allFiles = preparedFiles.concat(datasetFiles).map((file, index) => ({ file, index }))
  if (override && override >= 0 && override < allFiles.length) {
    return [allFiles[override]!]
  }
  const actualStartIndex = process.env.COVERAGE ? 0 : startIndex
  return allFiles.slice(actualStartIndex, numberOfFiles ? actualStartIndex + numberOfFiles : undefined)
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
