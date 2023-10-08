import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { Plugin } from '@cm2ml/plugin'
import { compose } from '@cm2ml/plugin'
import { TreeEncoder } from '@cm2ml/tree-encoder'
import { XmiTransformer } from '@cm2ml/xmi-plugin'

import type { XmiModel } from '../../xmi-model/dist/types/index.mjs'

export const xmiEncoders: Plugin<XmiModel, unknown, any>[] = [
  GraphEncoder,
  TreeEncoder,
]

export const stringEncoders: Plugin<string, unknown, any>[] = [
  compose(XmiTransformer, GraphEncoder),
  compose(XmiTransformer, TreeEncoder),
]
