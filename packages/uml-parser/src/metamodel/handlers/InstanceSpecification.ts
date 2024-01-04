import type { GraphNode } from '@cm2ml/ir'

import { InstanceSpecification } from '../metamodel'

export const InstanceSpecificationHandler = InstanceSpecification.createHandler(
  (instanceSpecification, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_classifier(instanceSpecification)
    addEdge_slot(instanceSpecification)
    addEdge_specification(instanceSpecification)
  },
)

function addEdge_classifier(_instanceSpecification: GraphNode) {
  // TODO
  // classifier : Classifier [0..*] (opposite A_classifier_instanceSpecification::instanceSpecification)
  // The Classifier or Classifiers of the represented instance. If multiple Classifiers are specified, the instance is classified by all of them.
}

function addEdge_slot(_instanceSpecification: GraphNode) {
  // TODO
  // ♦ slot : Slot [0..*]{subsets Element::ownedElement} (opposite Slot::owningInstance)
  // A Slot giving the value or values of a StructuralFeature of the instance. An InstanceSpecification can have one Slot per StructuralFeature of its Classifiers, including inherited features. It is not necessary to model a Slot for every StructuralFeature, in which case the InstanceSpecification is a partial description.
}

function addEdge_specification(_instanceSpecification: GraphNode) {
  // TODO
  // ♦ specification : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_specification_owningInstanceSpec::owningInstanceSpec)
  // A specification of how to compute, derive, or construct the instance.
}
