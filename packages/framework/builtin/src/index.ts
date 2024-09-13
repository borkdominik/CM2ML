import { ArchimateParser } from '@cm2ml/archimate'
import { BagOfPathsEncoder } from '@cm2ml/bag-of-paths-encoder'
import { EcoreParser } from '@cm2ml/ecore'
import { StandaloneFeatureEncoder } from '@cm2ml/feature-encoder'
import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { PatternMiner } from '@cm2ml/pattern-miner'
import { type ExecutionError, type Plugin, type StructuredOutput, batchTryCatch, compose, liftMetadata } from '@cm2ml/plugin'
import { TermFrequencyEncoder } from '@cm2ml/tf-encoder'
import { TreeEncoder } from '@cm2ml/tree-encoder'
import { UmlParser } from '@cm2ml/uml'
import { Stream } from '@yeger/streams'

export * from '@cm2ml/archimate'
export * from '@cm2ml/bag-of-paths-encoder'
export * from '@cm2ml/ecore'
export * from '@cm2ml/feature-encoder'
export * from '@cm2ml/graph-encoder'
export * from '@cm2ml/pattern-miner'
export * from '@cm2ml/tf-encoder'
export * from '@cm2ml/tree-encoder'
export * from '@cm2ml/uml'
export * from '@cm2ml/xmi-parser'

export type Parser = Plugin<string, GraphModel, any>

export const parsers: Parser[] = [ArchimateParser, EcoreParser, UmlParser]
export const parserMap = {
  [ArchimateParser.name]: ArchimateParser,
  [EcoreParser.name]: EcoreParser,
  [UmlParser.name]: UmlParser,
}

export type Encoder<Data = unknown, Metadata = unknown> = Plugin<(GraphModel | ExecutionError)[], (StructuredOutput<Data, Metadata> | ExecutionError)[], any>

export const encoders: Encoder[] = [BagOfPathsEncoder, GraphEncoder, TermFrequencyEncoder, PatternMiner, TreeEncoder]
export const encoderMap = {
  [BagOfPathsEncoder.name]: BagOfPathsEncoder,
  [GraphEncoder.name]: GraphEncoder,
  [PatternMiner.name]: PatternMiner,
  [StandaloneFeatureEncoder.name]: StandaloneFeatureEncoder,
  [TreeEncoder.name]: TreeEncoder,
  [TermFrequencyEncoder.name]: TermFrequencyEncoder,
}

type LiftedEncoder<Data = unknown, Metadata = unknown> = Plugin<(GraphModel | ExecutionError)[], StructuredOutput<(Data | ExecutionError)[], Metadata>, any>
const liftedEncoders: LiftedEncoder[] = Stream.from(encoders).map((encoder) => compose(encoder, liftMetadata(), encoder.name)).toArray()

export type PrecomposedPlugin = Plugin<string[], StructuredOutput<(unknown | ExecutionError)[], unknown>, any>

export const plugins: PrecomposedPlugin[] = Stream
  .from(parsers)
  .map((parser) => batchTryCatch(parser, parser.name))
  .flatMap((parser) =>
    liftedEncoders.map((encoder) => compose(parser, encoder)),
  )
  .toArray()
