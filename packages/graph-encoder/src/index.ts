import { defineXmiPlugin } from '@cm2ml/xmi-plugin'

export const GraphEncoder = defineXmiPlugin({
  name: 'raw-graph',
  parameters: {},
  onInvoke(input, _parameters) {
    // TODO
    return input.show()
  },
})
