import type { GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'

export const TreeEncoder = definePlugin({
  name: 'tree',
  parameters: {
    maxDepth: {
      type: 'number',
      description: 'The maximum depth of the tree',
      defaultValue: 10,
    },
    maxChildren: {
      type: 'number',
      description: 'The maximum number of children per node',
      defaultValue: 4,
    },
    abortOnCycle: {
      type: 'boolean',
      description: 'Abort on first cycle',
      defaultValue: true,
    },
  },
  invoke(input: GraphModel, _parameters) {
    return input.show()
  },
})