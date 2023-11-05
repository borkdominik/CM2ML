import type { GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'

export const UmlParser = definePlugin({
  name: 'uml',
  parameters: {},
  invoke: (input: string) => parse(input),
})

function parse(_uml: string): GraphModel {
  // const document = parseDocument(uml, {
  //   xmlMode: true,
  // })
  throw new Error('Not yet implemented')
  // return new GraphModel(new GraphNode('TODO', {}, []), [], [])
}
