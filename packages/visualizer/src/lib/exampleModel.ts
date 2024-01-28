import { UmlParser } from '@cm2ml/builtin'

export const exampleModel = {
  serializedModel: __EXAMPLE_MODEL,
  parameters: {
    debug: false,
    idAttribute: 'xmi:id',
    onlyContainmentAssociations: true,
    relationshipsAsEdges: true,
    removeInvalidNodes: true,
    strict: true,
  },
  parser: UmlParser,
}
