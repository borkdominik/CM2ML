import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'
import { Stream } from '@yeger/streams'

import { resolve } from '../resolvers/resolve'
import { Dependency, NamedElement, Namespace, StringExpression } from '../uml-metamodel'

export const NamedElementHandler = NamedElement.createHandler(
  (namedElement, { onlyContainmentAssociations }) => {
    const clientDependency = resolve(namedElement, 'clientDependency', { many: true, type: Dependency })
    const nameExpression = resolve(namedElement, 'nameExpression', { type: StringExpression })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_clientDependency(namedElement, clientDependency)
    addEdge_nameExpression(namedElement, nameExpression)
    addEdge_namespace(namedElement)
  },
)

function addEdge_clientDependency(namedElement: GraphNode, clientDependency: GraphNode[]) {
  // /clientDependency : Dependency [0..*]{subsets A_source_directedRelationship::directedRelationship} (opposite Dependency::client)
  // Indicates the Dependencies that reference this NamedElement as a client.
  clientDependency.forEach((clientDependency) => {
    namedElement.model.addEdge('clientDependency', namedElement, clientDependency)
  })
}

function addEdge_nameExpression(namedElement: GraphNode, nameExpression: GraphNode | undefined) {
  // ♦ nameExpression : StringExpression [0..1]{subsets Element::ownedElement} (opposite A_nameExpression_namedElement::namedElement)
  // The StringExpression used to define the name of this NamedElement.
  if (!nameExpression) {
    return
  }
  namedElement.model.addEdge('nameExpression', namedElement, nameExpression)
}

function addEdge_namespace(namedElement: GraphNode) {
  const namespace = getParentOfType(namedElement, Namespace)
  if (!namespace) {
    return
  }
  namedElement.model.addEdge('namespace', namedElement, namespace)
  namespace.model.addEdge('ownedMember', namespace, namedElement)
  // TODO/Jan: Check if this can be removed
  if (Stream.from(namespace.outgoingEdges).find((edge) => edge.tag === 'member' && edge.target === namedElement)) {
    // Imported Element is already a member
    return
  }
  namespace.model.addEdge('member', namespace, namedElement)
}
