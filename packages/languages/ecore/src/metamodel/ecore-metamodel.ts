import { createMetamodel } from '@cm2ml/metamodel'
import type { HandlerPropagation, MetamodelElement } from '@cm2ml/metamodel'

import type { EcoreAbstractType, EcoreAttribute, EcoreTag, EcoreType } from './ecore'
import { Ecore } from './ecore'

export interface EcoreHandlerParameters extends HandlerPropagation {}

export type EcoreMetamodelElement = MetamodelElement<
  EcoreAttribute,
  EcoreType,
  EcoreAbstractType,
  EcoreTag,
  EcoreHandlerParameters
>

// @ts-expect-error Not yet implemented
// eslint-disable-next-line unused-imports/no-unused-vars
const { define, defineAbstract } = createMetamodel(Ecore)
