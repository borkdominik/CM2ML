import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Operation, Parameter, ParameterSet } from '../uml-metamodel'

// TODO
export const ParameterHandler = Parameter.createHandler(
  (parameter, { onlyContainmentAssociations }) => {
    const parameterSets = resolve(parameter, 'parameterSet', { many: true, type: ParameterSet })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_defaultValue(parameter)
    addEdge_operation(parameter)
    addEdge_parameterSet(parameter, parameterSets)
  },
  {
    [Uml.Attributes.default]: { type: 'string' },
    [Uml.Attributes.direction]: { type: 'category', defaultValue: 'in' },
    [Uml.Attributes.effect]: { type: 'category' },
    [Uml.Attributes.isException]: { type: 'boolean', defaultValue: 'false' },
    [Uml.Attributes.isStream]: { type: 'boolean', defaultValue: 'false' },
  },
)

function addEdge_defaultValue(_parameter: GraphNode) {
  // TODO/Association
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

function addEdge_parameterSet(parameter: GraphNode, parameterSets: GraphNode[]) {
  // parameterSet : ParameterSet [0..*] (opposite ParameterSet::parameter)
  // The ParameterSets containing the parameter.See ParameterSet.
  parameterSets.forEach((parameterSet) => {
    parameter.model.addEdge('parameterSet', parameter, parameterSet)
  })
}
