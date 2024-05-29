// import { GraphModel, GraphNode } from '@cm2ml/ir'
import { Model } from '../archimate-metamodel'

export const ModelHandler = Model.createPassthroughHandler()

// TODO: persist metadata

/*
export const ModelHandler = Model.createHandler(
    (model) => {
        persistMetadata(model)
    }
)

function persistMetadata(model: GraphNode) {
    model.model.metadata
}
*/
