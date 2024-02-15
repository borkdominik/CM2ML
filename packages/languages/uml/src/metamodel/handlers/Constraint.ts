import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Constraint } from '../uml-metamodel'

export const ConstraintHandler = Constraint.createHandler(
  (constraint, { onlyContainmentAssociations }) => {
    const constrainedElement = resolveFromAttribute(constraint, 'constrainedElement', { many: true })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_constrainedElement(constraint, constrainedElement)
    addEdge_context(constraint)
    addEdge_specification(constraint)
  },
)

function addEdge_constrainedElement(constraint: GraphNode, constrainedElement: GraphNode[]) {
  // TODO/Association
  // constrainedElement : Element [0..*]{ordered} (opposite A_constrainedElement_constraint::constraint)
  // The ordered set of Elements referenced by this Constraint.
  constrainedElement.forEach((element) => {
    constraint.model.addEdge('constrainedElement', constraint, element)
  })
}

function addEdge_context(_constraint: GraphNode) {
  // TODO/Association
  // context : Namespace [0..1]{subsets NamedElement::namespace} (opposite Namespace::ownedRule)
  // Specifies the Namespace that owns the Constraint.
}

function addEdge_specification(_constraint: GraphNode) {
  // TODO/Association
  // ♦ specification : ValueSpecification [1..1]{subsets Element::ownedElement} (opposite A_specification_owningConstraint::owningConstraint)
  // A condition that must be true when evaluated in order for the Constraint to be satisfied.
}
