import type { GraphNode } from '@cm2ml/ir'

import {
  Enumeration,
  EnumerationLiteral,
  requireParentOfType,
} from '../metamodel'

export const EnumerationLiteralHandler = EnumerationLiteral.createHandler(
  (enumerationLiteral) => {
    addEdge_classifier(enumerationLiteral)
    addEdge_enumeration(enumerationLiteral)
  },
)

function addEdge_classifier(_enumerationLiteral: GraphNode) {
  // TODO
  // /classifier : Enumeration [1..1]{redefines InstanceSpecification::classifier} (opposite A_classifier_enumerationLiteral::enumerationLiteral )
  // The classifier of this EnumerationLiteral derived to be equal to its Enumeration.
}

function addEdge_enumeration(enumerationLiteral: GraphNode) {
  const enumeration = requireParentOfType(enumerationLiteral, Enumeration)
  enumerationLiteral.model.addEdge(
    'enumeration',
    enumerationLiteral,
    enumeration,
  )
}
