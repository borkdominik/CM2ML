import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { NamedElement, Namespace } from '../uml-metamodel'

export const NamedElementHandler = NamedElement.createHandler(
  (namedElement, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_clientDependency(namedElement)
    addEdge_nameExpression(namedElement)
    addEdge_namespace(namedElement)
  },
)

function addEdge_clientDependency(_namedElement: GraphNode) {
  // TODO
  // /clientDependency : Dependency [0..*]{subsets A_source_directedRelationship::directedRelationship} (opposite Dependency::client)
  // Indicates the Dependencies that reference this NamedElement as a client.
}

function addEdge_nameExpression(_namedElement: GraphNode) {
  // TODO
  // ♦ nameExpression : StringExpression [0..1]{subsets Element::ownedElement} (opposite A_nameExpression_namedElement::namedElement)
  // The StringExpression used to define the name of this NamedElement.
}

function addEdge_namespace(namedElement: GraphNode) {
  const namespace = getParentOfType(namedElement, Namespace)
  if (!namespace) {
    return
  }
  namedElement.model.addEdge('namespace', namedElement, namespace)
}
