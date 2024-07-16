import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Constraint, Element, Namespace } from '../uml-metamodel'

export const ConstraintHandler = Constraint.createHandler(
  (constraint, { onlyContainmentAssociations }) => {
    const constrainedElements = resolve(constraint, 'constrainedElement', { many: true, type: Element })
    const context = resolve(constraint, 'context', { type: Namespace })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_constrainedElement(constraint, constrainedElements)
    addEdge_context(constraint, context)
    addEdge_specification(constraint)
  },
)

function addEdge_constrainedElement(constraint: GraphNode, constrainedElements: GraphNode[]) {
  // constrainedElement : Element [0..*]{ordered} (opposite A_constrainedElement_constraint::constraint)
  // The ordered set of Elements referenced by this Constraint.
  constrainedElements.forEach((constrainedElement) => {
    constraint.model.addEdge('constrainedElement', constraint, constrainedElement)
  })
}

function addEdge_context(constraint: GraphNode, context: GraphNode | undefined) {
  // context : Namespace [0..1]{subsets NamedElement::namespace} (opposite Namespace::ownedRule)
  // Specifies the Namespace that owns the Constraint.
  if (!context) {
    return
  }
  constraint.model.addEdge('context', constraint, context)
}

function addEdge_specification(_constraint: GraphNode) {
  // TODO/Association
  // ♦ specification : ValueSpecification [1..1]{subsets Element::ownedElement} (opposite A_specification_owningConstraint::owningConstraint)
  // A condition that must be true when evaluated in order for the Constraint to be satisfied.
}
