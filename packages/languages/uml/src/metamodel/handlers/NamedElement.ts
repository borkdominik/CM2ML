import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'
import { Stream } from '@yeger/streams'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Dependency, NamedElement, Namespace, StringExpression } from '../uml-metamodel'

export const NamedElementHandler = NamedElement.createHandler(
  (namedElement, { onlyContainmentAssociations }) => {
    const clientDependency = resolve(namedElement, 'clientDependency', { many: true, type: Dependency })
    const nameExpression = resolve(namedElement, 'nameExpression', { type: StringExpression })
    const namespace = getParentOfType(namedElement, Namespace)
    deriveAttribute_qualifiedName(namedElement, namespace)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_clientDependency(namedElement, clientDependency)
    addEdge_nameExpression(namedElement, nameExpression)
    addEdge_namespace(namedElement, namespace)
  },
  {
    [Uml.Attributes.name]: { type: 'string' },
    [Uml.Attributes.qualifiedName]: { type: 'string' },
    [Uml.Attributes.visibility]: { type: 'category' },
  },
)

function deriveAttribute_qualifiedName(namedElement: GraphNode, namespace: GraphNode | undefined) {
  // A name that allows the NamedElement to be identified within a hierarchy of nested Namespaces.
  // It is constructed from the names of the containing Namespaces starting at the root of the hierarchy
  // and ending with the name of the NamedElement itself.
  const ownName = namedElement.getAttribute(Uml.Attributes.name)?.value.literal
  if (ownName === undefined) {
    return
  }
  const nameHierarchy: string[] = [ownName]

  function addNamePartToHierarchy(node: GraphNode) {
    const name = node.getAttribute(Uml.Attributes.name)?.value.literal
    if (name === undefined) {
      return false
    }
    nameHierarchy.push(name)
    const parent = getParentOfType(node, Namespace)
    if (parent) {
      return addNamePartToHierarchy(parent)
    }
    return true
  }

  if (namespace) {
    const allAreNamed = addNamePartToHierarchy(namespace)
    if (!allAreNamed) {
      return
    }
  }

  const qualifiedName = nameHierarchy.reverse().join('::')
  namedElement.addAttribute({ name: Uml.Attributes.qualifiedName, type: 'string', value: { literal: qualifiedName } })
}

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

function addEdge_namespace(namedElement: GraphNode, namespace: GraphNode | undefined) {
  if (!namespace) {
    return
  }
  namedElement.model.addEdge('namespace', namedElement, namespace)
  namespace.model.addEdge('ownedMember', namespace, namedElement)
  if (Stream.from(namespace.outgoingEdges).find((edge) => edge.tag === 'member' && edge.target === namedElement)) {
    // namedElement is already a member
    return
  }
  namespace.model.addEdge('member', namespace, namedElement)
}
