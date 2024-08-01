import { Archimate } from '../archimate'
import { Model } from '../archimate-metamodel'

export const ModelHandler = Model.createHandler(
  () => {},
  {
    [Archimate.Attributes.id]: { type: 'string' },
    [Archimate.Attributes.name]: { type: 'string' },
    [Archimate.Attributes.version]: { type: 'string' },
  },
)
