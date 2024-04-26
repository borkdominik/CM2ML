import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { resolve } from '../resolvers/resolve'
import { Uml, transformNodeToEdgeCallback } from '../uml'
import { Association, Extension, Property, Type } from '../uml-metamodel'

export const AssociationHandler = Association.createHandler(
  (association, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const navigableOwnedEnds = resolve(association, 'navigableOwnedEnd', { many: true, type: Property })
    const resolvedOwnedEnds = resolve(association, 'ownedEnd', { many: true, type: Property })
    const resolvedMemberEnds = resolve(association, 'memberEnd', { many: true, type: Property })
    const ownedEnds = Stream.from(resolvedOwnedEnds).concat(navigableOwnedEnds).distinct().toArray()
    const memberEnds = Stream.from(resolvedMemberEnds).concat(ownedEnds).distinct().toArray()
    const endTypes = deriveEndTypes(memberEnds)
    if (!onlyContainmentAssociations) {
      addEdge_opposite(resolvedMemberEnds)
    }
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(association, resolvedMemberEnds, resolvedMemberEnds)
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_endType(association, endTypes)
    addEdge_memberEnd(association, memberEnds)
    addEdge_navigableOwnedEnd(association, navigableOwnedEnds)
    addEdge_ownedEnd(association, ownedEnds)
  },
  {
    [Uml.Attributes.isDerived]: { type: 'boolean', defaultValue: 'false' },
  },
)

function deriveEndTypes(memberEnds: GraphNode[]) {
  return Stream.from(memberEnds)
    .map((memberEnd) => {
      const resolved = resolve(memberEnd, 'type', { removeAttribute: false, type: Type })
      if (resolved) {
        return resolved
      }
      // Type may have been resolved already, search edges
      return Stream.from(memberEnd.outgoingEdges).find((edge) => edge.tag === 'type')?.target
    })
    .filterNonNull()
    .distinct()
    .toArray()
}

function addEdge_endType(association: GraphNode, endTypes: GraphNode[]) {
  // /endType : Type [1..*]{subsets Relationship::relatedElement} (opposite A_endType_association::association)
  // The Classifiers that are used as types of the ends of the Association.
  endTypes.forEach((endType) => {
    association.model.addEdge('endType', association, endType)
    association.model.addEdge('relatedElement', association, endType)
  })
}

function addEdge_memberEnd(association: GraphNode, memberEnds: GraphNode[]) {
  // memberEnd: Property[2..*]{ ordered, subsets Namespace:: member } (opposite Property::association)
  // Each end represents participation of instances of the Classifier connected to the end in links of the Association.
  memberEnds.forEach((memberEnd) => {
    association.model.addEdge('memberEnd', association, memberEnd)
  })
}

function addEdge_opposite(memberEnds: GraphNode[]) {
  const [first, second] = memberEnds
  const isBinary = memberEnds.length === 2 && first !== undefined && second !== undefined
  if (!isBinary) {
    return
  }
  first.model.addEdge('opposite', first, second)
  second.model.addEdge('opposite', second, first)
}

function addEdge_navigableOwnedEnd(association: GraphNode, navigableOwnedEnds: GraphNode[]) {
  // navigableOwnedEnd: Property[0..*]{subsets Association:: ownedEnd } (opposite A_navigableOwnedEnd_association::association)
  // The navigable ends that are owned by the Association itself.
  navigableOwnedEnds.forEach((navigableOwnedEnd) => {
    association.model.addEdge('navigableOwnedEnds', association, navigableOwnedEnd)
  })
}

function addEdge_ownedEnd(association: GraphNode, ownedEnds: GraphNode[]) {
  if (Extension.isAssignable(association)) {
    // Extension redefines ownedEnd, so we don't want to add it again
    return
  }
  // ♦ ownedEnd : Property [0..*]{ordered, subsets Classifier::feature, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Association::memberEnd, subsets Namespace::ownedMember} (opposite Property::owningAssociation)
  // The ends that are owned by the Association itself.
  ownedEnds.forEach((ownedEnd) => {
    association.model.addEdge('ownedEnd', association, ownedEnd)
  })
}
