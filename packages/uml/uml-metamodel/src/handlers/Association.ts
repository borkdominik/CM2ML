import type { GraphNode } from '@cm2ml/ir'

import { Association } from '../uml-metamodel'

export const AssociationHandler = Association.createHandler(
  (association, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    if (relationshipsAsEdges) {
      // TODO: Include associations?
      association.model.removeNode(association)
      return false
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_endType(association)
    addEdge_memberEnd(association)
    addEdge_navigableOwnerEnd(association)
    addEdge_ownedEnd(association)
  },
)

function addEdge_endType(_association: GraphNode) {
  // TODO
  // /endType : Type [1..*]{subsets Relationship::relatedElement} (opposite A_endType_association::association)
  // The Classifiers that are used as types of the ends of the Association.
}

function addEdge_memberEnd(_association: GraphNode) {
  // TODO
  // memberEnd: Property[2..*]{ ordered, subsets Namespace:: member } (opposite Property::association)
  // Each end represents participation of instances of the Classifier connected to the end in links of the Association.
}

function addEdge_navigableOwnerEnd(_association: GraphNode) {
  // TODO
  // navigableOwnedEnd: Property[0..*]{subsets Association:: ownedEnd } (opposite A_navigableOwnedEnd_association::association)
  // The navigable ends that are owned by the Association itself.
}

function addEdge_ownedEnd(_association: GraphNode) {
  // TODO
  // ♦ ownedEnd : Property [0..*]{ordered, subsets Classifier::feature, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Association::memberEnd, subsets Namespace::ownedMember} (opposite Property::owningAssociation)
  // The ends that are owned by the Association itself.
}
