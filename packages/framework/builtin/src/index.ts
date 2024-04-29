import { ArchimateParser } from '@cm2ml/archimate'
import { EcoreParser } from '@cm2ml/ecore'
import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { OneHotEncoder } from '@cm2ml/one-hot-encoder'
import { type Plugin, batchedCompose, compose, liftMetadata } from '@cm2ml/plugin'
import { TreeEncoder } from '@cm2ml/tree-encoder'
import { UmlParser } from '@cm2ml/uml'

export * from '@cm2ml/archimate'
export * from '@cm2ml/ecore'
export * from '@cm2ml/feature-encoder'
export * from '@cm2ml/graph-encoder'
export * from '@cm2ml/one-hot-encoder'
export * from '@cm2ml/tree-encoder'
export * from '@cm2ml/uml'
export * from '@cm2ml/xmi-parser'

export type Parser = Plugin<string, GraphModel, any, any>

export const parsers: Parser[] = [ArchimateParser, EcoreParser, UmlParser]

export const parserMap = {
  [ArchimateParser.name]: ArchimateParser,
  [EcoreParser.name]: EcoreParser,
  [UmlParser.name]: UmlParser,
}

export type EncoderMetadata = any

export type Encoder<Encoding = unknown> = Plugin<GraphModel, Encoding, any, any>

export const encoders: Encoder[] = [GraphEncoder, TreeEncoder, OneHotEncoder]

export const encoderMap = {
  [GraphEncoder.name]: GraphEncoder,
  [TreeEncoder.name]: TreeEncoder,
  [OneHotEncoder.name]: OneHotEncoder,
}

export const plugins = parsers.flatMap((parser) =>
  encoders.map((encoder) => compose(parser, encoder)),
)

export const batchedPlugins = parsers.flatMap((parser) =>
  encoders.map((encoder) => {
    const batched = batchedCompose(parser, encoder)
    return compose(batched, liftMetadata(), batched.name)
  }),
)
