import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { resolve } from '../resolvers/resolve'
import { Enumeration, EnumerationLiteral } from '../uml-metamodel'

export const EnumerationLiteralHandler = EnumerationLiteral.createHandler(
  (enumerationLiteral, { onlyContainmentAssociations }) => {
    // TODO/Jan: Use parent only as fallback for classifier
    const classifier = resolve(enumerationLiteral, 'classifier', { type: Enumeration })
    const enumeration = getParentOfType(
      enumerationLiteral,
      Enumeration,
    )
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_classifier(enumerationLiteral, classifier)
    // TODO/Jan: Also pass classifier here
    addEdge_enumeration(enumerationLiteral, enumeration)
  },
)

function addEdge_classifier(enumerationLiteral: GraphNode, classifier: GraphNode | undefined) {
  // /classifier : Enumeration [1..1]{redefines InstanceSpecification::classifier} (opposite A_classifier_enumerationLiteral::enumerationLiteral )
  // The classifier of this EnumerationLiteral derived to be equal to its Enumeration.
  if (!classifier) {
    return
  }
  enumerationLiteral.model.addEdge('classifier', enumerationLiteral, classifier)
}

function addEdge_enumeration(enumerationLiteral: GraphNode, enumeration: GraphNode | undefined) {
  // enumeration : Enumeration [1..1]{subsets NamedElement::namespace} (opposite Enumeration::ownedLiteral)
  // The Enumeration that this EnumerationLiteral is a member of.
  if (!enumeration) {
    return
  }
  enumerationLiteral.model.addEdge(
    'enumeration',
    enumerationLiteral,
    enumeration,
  )
}
