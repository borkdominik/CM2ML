import type { GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'

import { createTree } from './tree-transformer'

export type * from './tree-model'

export const TreeEncoder = definePlugin({
  name: 'tree',
  parameters: {},
  invoke(input: GraphModel, _parameters) {
    return createTree(input)
  },
})
