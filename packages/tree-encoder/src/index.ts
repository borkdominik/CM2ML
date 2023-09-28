import { definePlugin } from '@cm2ml/plugin'
import { parse } from '@cm2ml/xmi-parser'

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
  invoke(input, _parameters) {
    // TODO
    const xmi = parse(input)
    return xmi
  },
})
