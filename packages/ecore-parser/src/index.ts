import type { GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'

export const EcoreParser = definePlugin({
  name: 'ecore',
  parameters: {},
  invoke: (input: string) => parse(input),
})

function parse(_ecore: string): GraphModel {
  // const document = parseDocument(uml, {
  //   xmlMode: true,
  // })
  throw new Error('Not yet implemented')
  // return new GraphModel(new GraphNode('TODO', {}, []), [], [])
}
