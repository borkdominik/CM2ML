import type { Parser } from '@cm2ml/builtin'
import { UmlParser, ArchimateParser } from '@cm2ml/builtin'

export interface PreparedExample {
  name: string
  serializedModel: string
  parameters: {
    debug?: boolean
    onlyContainmentAssociations?: boolean
    relationshipsAsEdges?: boolean
    strict?: boolean
  },
  parser: Parser
}

export const exampleModels: [string, PreparedExample[]][] = __EXAMPLE_MODELS.map(({ language, models }) => {
  if (language === 'uml') {
    return ['UML', prepareUmlExampleModels(models)]
  } else if (language === 'archimate') {
    return ['ARCHIMATE', prepareArchimateExampleModels(models)]
  }
  return [language, []]
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
    parser: ArchimateParser
  }))
}
