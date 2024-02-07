import { HandlerPropagation, MetamodelElement, createMetamodel } from "@cm2ml/metamodel";
import { Archimate, ArchimateAbstractType, ArchimateTag, ArchimateType } from "./archimate";

export interface ArchimateHandlerParameters extends HandlerPropagation {}

export type ArchimateMetamodelElement = MetamodelElement<
    ArchimateType,
    ArchimateAbstractType,
    ArchimateTag,
    ArchimateHandlerParameters
>

// @ts-expect-error Not yet implemented
// eslint-disable-next-line unused-imports/no-unused-vars
const { define, defineAbstract } = createMetamodel<
    ArchimateType,
    ArchimateAbstractType,
    ArchimateTag,
    ArchimateHandlerParameters
>(Archimate)
