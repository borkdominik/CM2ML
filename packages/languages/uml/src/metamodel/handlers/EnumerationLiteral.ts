import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Enumeration, EnumerationLiteral } from '../uml-metamodel'

export const EnumerationLiteralHandler = EnumerationLiteral.createHandler(
  (enumerationLiteral, { onlyContainmentAssociations }) => {
    const classifier = resolveFromAttribute(enumerationLiteral, 'classifier')
    const enumeration = getParentOfType(
      enumerationLiteral,
      Enumeration,
    )
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_classifier(enumerationLiteral, classifier)
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
  if (!enumeration) {
    return
  }
  enumerationLiteral.model.addEdge(
    'enumeration',
    enumerationLiteral,
    enumeration,
  )
}
