import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Classifier, EnumerationLiteral, InstanceSpecification, Slot } from '../uml-metamodel'

export const InstanceSpecificationHandler = InstanceSpecification.createHandler(
  (instanceSpecification, { onlyContainmentAssociations }) => {
    const classifiers = getClassifiers(instanceSpecification)
    const slots = resolve(instanceSpecification, 'slot', { many: true, type: Slot })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_classifier(instanceSpecification, classifiers)
    addEdge_slot(instanceSpecification, slots)
    addEdge_specification(instanceSpecification)
  },
)

function getClassifiers(instanceSpecification: GraphNode) {
  if (EnumerationLiteral.isAssignable(instanceSpecification)) {
    // EnumerationLiteral redefines InstanceSpecification::classifier
    return []
  }
  return resolve(instanceSpecification, 'classifier', { many: true, type: Classifier })
}

function addEdge_classifier(instanceSpecification: GraphNode, classifiers: GraphNode[]) {
  // classifier : Classifier [0..*] (opposite A_classifier_instanceSpecification::instanceSpecification)
  // The Classifier or Classifiers of the represented instance. If multiple Classifiers are specified, the instance is classified by all of them.
  classifiers.forEach((classifier) => {
    instanceSpecification.model.addEdge('classifier', instanceSpecification, classifier)
  })
}

function addEdge_slot(instanceSpecification: GraphNode, slots: GraphNode[]) {
  // ♦ slot : Slot [0..*]{subsets Element::ownedElement} (opposite Slot::owningInstance)
  // A Slot giving the value or values of a StructuralFeature of the instance. An InstanceSpecification can have one Slot per StructuralFeature of its Classifiers, including inherited features. It is not necessary to model a Slot for every StructuralFeature, in which case the InstanceSpecification is a partial description.
  slots.forEach((slot) => {
    instanceSpecification.model.addEdge('slot', instanceSpecification, slot)
  })
}

function addEdge_specification(_instanceSpecification: GraphNode) {
  // TODO/Association
  // ♦ specification : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_specification_owningInstanceSpec::owningInstanceSpec)
  // A specification of how to compute, derive, or construct the instance.
}
