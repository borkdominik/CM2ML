import type { GraphNode } from '@cm2ml/ir'

import { Operation, Parameter, getParentOfType } from '../metamodel'

// TODO
export const ParameterHandler = Parameter.createHandler((node) => {
  addEdge_defaultValue(node)
  addEdge_operation(node)
  addEdge_parameterSet(node)
})

function addEdge_defaultValue(_parameter: GraphNode) {
  // TODO
  // ♦ defaultValue : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_defaultValue_owningParameter::owningParameter)
  // Specifies a ValueSpecification that represents a value to be used when no argument is supplied for the Parameter.
}

function addEdge_operation(parameter: GraphNode) {
  const operation = getParentOfType(parameter, Operation)
  if (!operation) {
    return
  }
  parameter.model.addEdge('operation', parameter, operation)
}

function addEdge_parameterSet(_parameter: GraphNode) {
  // TODO
  // parameterSet : ParameterSet [0..*] (opposite ParameterSet::parameter)
  // The ParameterSets containing the parameter.See ParameterSet.
}
