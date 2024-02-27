import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml, transformNodeToEdgeCallback } from '../uml'
import { Association, Extension, Property } from '../uml-metamodel'

export const AssociationHandler = Association.createHandler(
  (association, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const memberEnds = resolve(association, 'memberEnd', { many: true, type: Property })
    const navigableOwnedEnds = resolve(association, 'navigableOwnedEnd', { many: true, type: Property })
    const ownedEnds = getOwnedEnds(association)
    if (relationshipsAsEdges) {
      // TODO: Include associations at all?
      return transformNodeToEdgeCallback(association, memberEnds[0], memberEnds[1])
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_endType(association)
    addEdge_memberEnd(association, memberEnds)
    addEdge_navigableOwnedEnd(association, navigableOwnedEnds)
    addEdge_ownedEnd(association, ownedEnds)
  },
  {
    [Uml.Attributes.isDerived]: 'false',
  },
)

function getOwnedEnds(association: GraphNode) {
  if (Extension.isAssignable(association)) {
    // Extension redefines the ownedEnd attribute, hence we have to return here or end up with duplicate edges
    return []
  }
  return resolve(association, 'ownedEnd', { many: true, type: Property })
}

function addEdge_endType(_association: GraphNode) {
  // TODO/Association
  // /endType : Type [1..*]{subsets Relationship::relatedElement} (opposite A_endType_association::association)
  // The Classifiers that are used as types of the ends of the Association.
}

function addEdge_memberEnd(association: GraphNode, memberEnds: GraphNode[]) {
  // memberEnd: Property[2..*]{ ordered, subsets Namespace:: member } (opposite Property::association)
  // Each end represents participation of instances of the Classifier connected to the end in links of the Association.
  memberEnds.forEach((memberEnd) =>
    association.model.addEdge('memberEnd', association, memberEnd),
  )
}

function addEdge_navigableOwnedEnd(association: GraphNode, navigableOwnedEnds: GraphNode[]) {
  // navigableOwnedEnd: Property[0..*]{subsets Association:: ownedEnd } (opposite A_navigableOwnedEnd_association::association)
  // The navigable ends that are owned by the Association itself.
  navigableOwnedEnds.forEach((navigableOwnedEnd) =>
    association.model.addEdge('navigableOwnedEnds', association, navigableOwnedEnd),
  )
}

function addEdge_ownedEnd(association: GraphNode, ownedEnds: GraphNode[]) {
  // ♦ ownedEnd : Property [0..*]{ordered, subsets Classifier::feature, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Association::memberEnd, subsets Namespace::ownedMember} (opposite Property::owningAssociation)
  // The ends that are owned by the Association itself.
  ownedEnds.forEach((ownedEnd) =>
    association.model.addEdge('ownedEnd', association, ownedEnd),
  )
}
