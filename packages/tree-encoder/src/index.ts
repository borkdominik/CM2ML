import { definePlugin } from '@cm2ml/plugin'

export const TreeEncoder = definePlugin({
  name: 'tree',
  parameters: {
    maxDepth: {
      type: 'number',
      description: 'The maximum depth of the tree',
    },
    maxChildren: {
      type: 'number',
      description: 'The maximum number of children per node',
    },
  },
  invoke(input, parameters) {
    // TODO
    return JSON.stringify({ input, parameters })
  },
})
