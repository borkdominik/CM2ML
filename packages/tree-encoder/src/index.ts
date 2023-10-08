import { definePlugin } from '@cm2ml/plugin'
import type { XmiModel } from '@cm2ml/xmi-model'

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
  invoke(input: XmiModel, _parameters) {
    // TODO
    return input.show()
  },
})
