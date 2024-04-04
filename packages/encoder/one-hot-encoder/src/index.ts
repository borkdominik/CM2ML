import type { GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'

export const OneHotEncoder = definePlugin({
  name: 'one-hot',
  parameters: {

  },
  invoke(input: GraphModel, _parameters) {
    return input.show()
  },
})
