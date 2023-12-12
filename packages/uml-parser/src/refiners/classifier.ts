import { extendMultiple } from './element'
import { Namespace } from './namespace'
import { RedefinableElement } from './redefinableElement'

// TODO
export const Classifier = extendMultiple(
  [Namespace, RedefinableElement],
  () => false,
)
