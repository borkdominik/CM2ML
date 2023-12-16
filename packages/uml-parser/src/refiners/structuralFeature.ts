import { UmlElement } from './element'
import { MultiplicityElement } from './multiplicityElement'
import { TypedElement } from './typedElement'

// TODO
export const StructuralFeature = UmlElement.extendMultiple(
  [MultiplicityElement, TypedElement],
  () => false,
)
