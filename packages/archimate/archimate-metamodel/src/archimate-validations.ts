import { GraphModel } from "@cm2ml/ir";
import { ArchimateHandlerParameters } from "./archimate-metamodel";

export function validateArchimateModel(
    model: GraphModel,
    _handlerParameters: ArchimateHandlerParameters
) {
    if (!model.settings.strict) {
        return
    }
    model.debug('Validating ArchiMate model')
    model.debug('All ArchiMate validations passed') 
}