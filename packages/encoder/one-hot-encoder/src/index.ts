import type { GraphModel } from '@cm2ml/ir'
import { batchTryCatch, defineStructuredPlugin } from '@cm2ml/plugin'

export const OneHotEncoder = batchTryCatch(defineStructuredPlugin({
  name: 'one-hot',
  parameters: {
  },
  invoke(input: GraphModel, _parameters) {
    return {
      data: input.show(),
      metadata: undefined,
    }
  },
}), 'one-hot')
