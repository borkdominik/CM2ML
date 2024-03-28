import { EcoreParser } from '@cm2ml/ecore'
import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { type Plugin, batch, compose } from '@cm2ml/plugin'
import { TreeEncoder } from '@cm2ml/tree-encoder'
import { UmlParser } from '@cm2ml/uml'

export * from '@cm2ml/ecore'
export * from '@cm2ml/graph-encoder'
export * from '@cm2ml/tree-encoder'
export * from '@cm2ml/uml'
export * from '@cm2ml/xmi-parser'

export type Parser = Plugin<string, GraphModel, any>

export const parsers: Parser[] = [EcoreParser, UmlParser]

export const parserMap = {
  [EcoreParser.name]: EcoreParser,
  [UmlParser.name]: UmlParser,
}

export type Encoder = Plugin<GraphModel, unknown, any>

export const encoders: Encoder[] = [GraphEncoder, TreeEncoder]

export const encoderMap = {
  [GraphEncoder.name]: GraphEncoder,
  [TreeEncoder.name]: TreeEncoder,
}

export const plugins = parsers.flatMap((parser) =>
  encoders.map((encoder) => compose(parser, encoder)),
)

export const batchedPlugins = parsers.flatMap((parser) =>
  encoders.map((encoder) => batch(parser, encoder)),
)
