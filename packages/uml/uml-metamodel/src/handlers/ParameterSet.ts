import type { GraphNode } from '@cm2ml/ir'

import { ParameterSet } from '../uml-metamodel'

export const ParameterSetHandler = ParameterSet.createHandler(
  (parameterSet, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_condition(parameterSet)
    addEdge_parameter(parameterSet)
  },
)

function addEdge_condition(_parameterSet: GraphNode) {
  // TODO/Association
  // ♦ condition : Constraint [0..*]{subsets Element::ownedElement} (opposite A_condition_parameterSet::parameterSet)
  // A constraint that should be satisfied for the owner of the Parameters in an input ParameterSet to start execution using the values provided for those Parameters, or the owner of the Parameters in an output ParameterSet to end execution providing the values for those Parameters, if all preconditions and conditions on input ParameterSets were satisfied.
}

function addEdge_parameter(_parameterSet: GraphNode) {
  // TODO/Association
  // parameter : Parameter [1..*] (opposite Parameter::parameterSet)
  // Parameters in the ParameterSet.
}
