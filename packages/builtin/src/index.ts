import { EcoreParser } from '@cm2ml/ecore-parser'
import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { type Plugin, compose } from '@cm2ml/plugin'
import { TreeEncoder } from '@cm2ml/tree-encoder'
import { UmlParser } from '@cm2ml/uml-parser'
import { XmiParser } from '@cm2ml/xmi-parser'

export const parsers: Plugin<string, GraphModel, any>[] = [
  EcoreParser,
  UmlParser,
  XmiParser,
]

export const encoders: Plugin<GraphModel, unknown, any>[] = [
  GraphEncoder,
  TreeEncoder,
]

export const plugins = parsers.flatMap((parser) =>
  encoders.map((encoder) => compose(parser, encoder)),
)