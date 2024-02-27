import { Uml } from '../uml'
import { PackageableElement } from '../uml-metamodel'

export const PackageableElementHandler =
  PackageableElement.createPassthroughHandler({
    [Uml.Attributes.visibility]: 'public',
  })
