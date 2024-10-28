import { ArchimateParser } from '@cm2ml/archimate'
import { BagOfPathsEncoder } from '@cm2ml/bag-of-paths-encoder'
import type { DuplicateSymbol } from '@cm2ml/deduplicate'
import { deduplicate } from '@cm2ml/deduplicate'
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

export const encoders: Encoder[] = [
  BagOfPathsEncoder,
  GraphEncoder,
  PatternMiner,
  StandaloneFeatureEncoder,
  TermFrequencyEncoder,
  TreeEncoder,
]
export const encoderMap = {
  [BagOfPathsEncoder.name]: BagOfPathsEncoder,
  [GraphEncoder.name]: GraphEncoder,
  [PatternMiner.name]: PatternMiner,
  [StandaloneFeatureEncoder.name]: StandaloneFeatureEncoder,
  [TermFrequencyEncoder.name]: TermFrequencyEncoder,
  [TreeEncoder.name]: TreeEncoder,
}

export type PreparedEncoder<Data = unknown, Metadata = unknown> = Plugin<(GraphModel | ExecutionError)[], StructuredOutput<(Data | ExecutionError | DuplicateSymbol)[], Metadata>, any>

/**
 * Prepare an encoder for use in a plugin adapter.
 * This process includes lifting metadata from each entry and moving it to the batch level.
 * In addition, the duplicate filter plugin is added as a final step.
 */
export function prepareEncoder(encoder: Encoder): PreparedEncoder {
  return compose(compose(encoder, liftMetadata()), deduplicate(), encoder.name)
}

export type PreparedPlugin = Plugin<string[], StructuredOutput<(unknown | ExecutionError)[], unknown>, any>

/**
 * Prepare a list of parsers and encoders for use in a plugin adapter.
 */
export function preparePlugins(parsers: Parser[], encoders: Encoder[]): PreparedPlugin[] {
  const preparedEncoders: PreparedEncoder[] = encoders.map(prepareEncoder)
  return Stream
    .from(parsers)
    .map((parser) => batchTryCatch(parser, parser.name))
    .flatMap((parser) =>
      preparedEncoders.map((encoder) => compose(parser, encoder)),
    )
    .toArray()
}

export const plugins: PreparedPlugin[] = preparePlugins(parsers, encoders)
