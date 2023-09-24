import { definePlugin } from '@cm2ml/plugin'

export const GraphEncoder = definePlugin({
  name: 'raw-graph',
  parameters: {},
  invoke(input, parameters) {
    // TODO
    return JSON.stringify({ input, parameters })
  },
})
