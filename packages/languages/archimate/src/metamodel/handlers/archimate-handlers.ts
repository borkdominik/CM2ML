import type { ArchimateMetamodelElement } from '../archimate-metamodel'

import { DocumentationHandler } from './Documentation'
import { ElementHandler } from './Elements'
import { FolderHandler } from './Folder'
import { ModelHandler } from './Model'
import { PurposeHandler } from './Purpose'

export const archimateHandlers: Record<
  `${string}Handler`,
  ArchimateMetamodelElement
> = {
  ModelHandler,
  FolderHandler,
  ElementHandler,
  PurposeHandler,
  DocumentationHandler,
}
