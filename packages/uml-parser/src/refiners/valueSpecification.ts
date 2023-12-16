import { extendMultiple } from './element'
import { PackageableElement } from './packageableElement'
import { TypedElement } from './typedElement'

// TODO
export const ValueSpecification = extendMultiple(
  [PackageableElement, TypedElement],
  () => false,
)
