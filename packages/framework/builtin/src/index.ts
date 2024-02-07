import { ArchimateParser } from '@cm2ml/archimate-parser'
import { EcoreParser } from '@cm2ml/ecore-parser'
import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { type Plugin, compose } from '@cm2ml/plugin'
import { TreeEncoder } from '@cm2ml/tree-encoder'
import { UmlParser } from '@cm2ml/uml-parser'

export * from '@cm2ml/ecore-parser'
export * from '@cm2ml/graph-encoder'
export * from '@cm2ml/tree-encoder'
export * from '@cm2ml/uml-parser'
export * from '@cm2ml/xmi-parser'

export type Parser = Plugin<string, GraphModel, any>

export const parsers: Parser[] = [ArchimateParser, EcoreParser, UmlParser]

export const parserMap = {
  [ArchimateParser.name]: ArchimateParser,
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
