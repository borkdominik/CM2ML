import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { Association } from '../uml-metamodel'

export const AssociationHandler = Association.createHandler(
  (association, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const memberEnds = extractMemberEnds(association)
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
    addEdge_navigableOwnerEnd(association)
    association.children.forEach((child) => {
      addEdge_ownedEnd(association, child)
    })
  },
  {
    [Uml.Attributes.isDerived]: 'false',
  },
)

function extractMemberEnds(association: GraphNode) {
  const memberEndsAttribute =
    association.getAttribute('memberEnd')?.value.literal
  association.removeAttribute('memberEnd')
  if (!memberEndsAttribute) {
    return []
  }
  return memberEndsAttribute.split(' ').map((memberEndId) => {
    const memberEnd = association.model.getNodeById(memberEndId)
    if (!memberEnd) {
      throw new Error(
        `memberEnd ${memberEndId} of ${association.id} not found: ${memberEndId}`,
      )
    }
    return memberEnd
  })
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

function addEdge_navigableOwnerEnd(_association: GraphNode) {
  // TODO/Association
  // navigableOwnedEnd: Property[0..*]{subsets Association:: ownedEnd } (opposite A_navigableOwnedEnd_association::association)
  // The navigable ends that are owned by the Association itself.
}

function addEdge_ownedEnd(association: GraphNode, child: GraphNode) {
  // ♦ ownedEnd : Property [0..*]{ordered, subsets Classifier::feature, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Association::memberEnd, subsets Namespace::ownedMember} (opposite Property::owningAssociation)
  // The ends that are owned by the Association itself.
  if (child.tag !== Uml.Tags.ownedEnd) {
    return
  }
  child.addAttribute({
    name: Uml.typeAttributeName,
    value: { namespace: 'uml', literal: Uml.Types.Property },
  })
  association.model.addEdge('ownedEnd', association, child)
  child.model.addEdge('owningAssociation', child, association)
}
