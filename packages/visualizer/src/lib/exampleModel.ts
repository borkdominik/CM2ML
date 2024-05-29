import type { Parser } from '@cm2ml/builtin'
import { ArchimateParser, ArchimateXmlParser, UmlParser } from '@cm2ml/builtin'

import { prettifyParserName } from './pluginNames'

export interface PreparedExample {
  name: string
  serializedModel: string
  parameters: {
    debug?: boolean
    onlyContainmentAssociations?: boolean
    relationshipsAsEdges?: boolean
    strict?: boolean
  }
  parser: Parser
}

export const exampleModels: [string, PreparedExample[]][] = __EXAMPLE_MODELS.map(({ language, models }) => {
  if (language === 'uml') {
    return [prettifyParserName(language), prepareUmlExampleModels(models)]
  } else if (language === 'archimate') {
    return [prettifyParserName(language), prepareArchimateExampleModels(models)]
  } else if (language === 'archimate-xml') {
    return [prettifyParserName(language), prepareArchimateXmlExampleModels(models)]
  }
  return [prettifyParserName(language), []]
})

function prepareUmlExampleModels(exampleModels: ExampleModel[]): PreparedExample[] {
  return exampleModels.map(({ name, model }) => ({
    name,
    serializedModel: model,
    parameters: {
      debug: false,
      onlyContainmentAssociations: false,
      relationshipsAsEdges: false,
      strict: true,
    },
    parser: UmlParser,
  }))
}

function prepareArchimateExampleModels(exampleModels: ExampleModel[]): PreparedExample[] {
  return exampleModels.map(({ name, model }) => ({
    name,
    serializedModel: model,
    parameters: {

    },
    parser: ArchimateParser,
  }))
}

function prepareArchimateXmlExampleModels(exampleModels: ExampleModel[]): PreparedExample[] {
  return exampleModels.map(({ name, model }) => ({
    name,
    serializedModel: model,
    parameters: {

    },
    parser: ArchimateXmlParser,
  }))
}
