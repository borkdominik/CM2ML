import { Uml } from '../uml'
import { Image } from '../uml-metamodel'

export const ImageHandler = Image.createPassthroughHandler({
  [Uml.Attributes.content]: { type: 'string' },
  [Uml.Attributes.format]: { type: 'string' },
  [Uml.Attributes.location]: { type: 'string' },
})
