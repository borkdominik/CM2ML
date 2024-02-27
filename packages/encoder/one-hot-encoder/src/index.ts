import type { GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'

export const OneHotEncoder = definePlugin({
    name: 'one-hot',
    parameters: {

    },
    invoke(input: GraphModel, {}) {
        return encode(input)
    }
})

export type OneHotEncoding = number[][]

function encode(model: GraphModel): OneHotEncoding {
    return [
        [0, 0, 1],
        [1, 0, 0],
        [0, 1, 0]
    ]
}