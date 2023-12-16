import { Uml } from '../uml'

import { BehavioredClassifier } from './behavioredClassifier'
import { extendMultiple } from './element'
import { EncapsulatedClassifier } from './encapsulatedClassifier'

// TODO
export const Class = extendMultiple(
  [BehavioredClassifier, EncapsulatedClassifier],
  (node) => Uml.getType(node) === Uml.Types.Class,
)
