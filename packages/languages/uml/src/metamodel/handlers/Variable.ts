import type { GraphNode } from '@cm2ml/ir'

import { Variable } from '../uml-metamodel'

export const VariableHandler = Variable.createHandler(
  (variable, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_activityScope(variable)
    addEdge_scope(variable)
  },
)

function addEdge_activityScope(_variable: GraphNode) {
  // TODO/Association
  // activityScope : Activity [0..1]{subsets NamedElement::namespace} (opposite Activity::variable)
  // An Activity that owns the Variable.
}

function addEdge_scope(_variable: GraphNode) {
  // TODO/Association
  // scope : StructuredActivityNode [0..1]{subsets NamedElement::namespace} (opposite StructuredActivityNode::variable)
  // A StructuredActivityNode that owns the Variable.
}
