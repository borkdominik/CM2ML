import { createRefiner } from "@cm2ml/metamodel-refiner";
import { Archimate, inferArchimateHandler, validateArchimateModel } from "@cm2ml/archimate-metamodel";
import { compose, definePlugin } from '@cm2ml/plugin'
import { GraphModel } from "@cm2ml/ir";
import { IrPostProcessor } from '@cm2ml/ir-post-processor'
import { createXmiParser } from '@cm2ml/xmi-parser'

const refine = createRefiner(Archimate, inferArchimateHandler)

export const ArchimateRefiner = definePlugin({
    name: 'archimate',
    parameters: {},
    invoke: (input: GraphModel, _parameters) => {
        const handlerParameters = {}
        const model = refine(input, handlerParameters)
        validateArchimateModel(model, handlerParameters)
        return model
    }
})

export const ArchimateParser = compose(
    createXmiParser(Archimate.Attributes['id'], () => {}),
    compose(ArchimateRefiner, IrPostProcessor),
    'archimate'
)