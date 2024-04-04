import type { HandlerPropagation, MetamodelElement } from '@cm2ml/metamodel'
import { createMetamodel } from '@cm2ml/metamodel'

import type {
  ArchimateAbstractType,
  ArchimateTag,
  ArchimateType,
} from './archimate'
import { Archimate } from './archimate'

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

export const Model = define(Archimate.Types.Model, Archimate.Tags['archimate:model'])

export const Folder = define(Archimate.Types.Folder, Archimate.Tags.folder)

export const Element = define(Archimate.Types.Element, Archimate.Tags.element)

export const Purpose = define(Archimate.Types.Purpose, Archimate.Tags.purpose)

export const Documentation = define(Archimate.Types.Documentation, Archimate.Tags.documentation)
