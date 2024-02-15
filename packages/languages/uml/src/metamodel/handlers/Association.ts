import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Association, Extension } from '../uml-metamodel'

export const AssociationHandler = Association.createHandler(
  (association, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const memberEnds = resolveFromAttribute(association, 'memberEnd', { many: true })
    const navigableOwnedEnds = resolveFromAttribute(association, 'navigableOwnedEnd', { many: true })
    const ownedEnds = getOwnedEnds(association)
    if (relationshipsAsEdges) {
      // TODO: Include associations?
      association.model.removeNode(association)
      return false
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_endType(association)
    addEdge_memberEnd(association, memberEnds)
    addEdge_navigableOwnedEnd(association, navigableOwnedEnds)
    ownedEnds.forEach((ownedEnd) => {
      addEdge_ownedEnd(association, ownedEnd)
    })
  },
  {
    [Uml.Attributes.isDerived]: 'false',
  },
)

// TODO/Jan: Implement same approach for Extension
function getOwnedEnds(association: GraphNode) {
  if (Extension.isAssignable(association)) {
    // Extension redefines the ownedEnd attribute, hence we have to return here
    return []
  }
  return Stream.from(association.children).filter((child) => child.tag === Uml.Tags.ownedEnd).forEach((child) => {
    // TODO/Jan: Only set as fallback
    child.addAttribute({
      name: Uml.typeAttributeName,
      value: { namespace: 'uml', literal: Uml.Types.Property },
    })
  }).toArray()
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
  // TODO/Association
  // navigableOwnedEnd: Property[0..*]{subsets Association:: ownedEnd } (opposite A_navigableOwnedEnd_association::association)
  // The navigable ends that are owned by the Association itself.
  navigableOwnedEnds.forEach((navigableOwnedEnd) =>
    association.model.addEdge('navigableOwnedEnds', association, navigableOwnedEnd),
  )
}

function addEdge_ownedEnd(association: GraphNode, ownedEnd: GraphNode) {
  // ♦ ownedEnd : Property [0..*]{ordered, subsets Classifier::feature, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Association::memberEnd, subsets Namespace::ownedMember} (opposite Property::owningAssociation)
  // The ends that are owned by the Association itself.
  association.model.addEdge('ownedEnd', association, ownedEnd)
}
