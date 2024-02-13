import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { ConditionalNode } from '../uml-metamodel'

export const ConditionalNodeHandler = ConditionalNode.createHandler(
  (conditionalNode, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_clause(conditionalNode)
    addEdge_result(conditionalNode)
  },
  {
    [Uml.Attributes.isAssured]: 'false',
    [Uml.Attributes.isDeterminate]: 'false',
  },
)

function addEdge_clause(_conditionalNode: GraphNode) {
  // TODO/Association
  // ♦ clause : Clause [1..*]{subsets Element::ownedElement} (opposite A_clause_conditionalNode::conditionalNode)
  // The set of Clauses composing the ConditionalNode.
}

function addEdge_result(_conditionalNode: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [0..*]{ordered, redefines StructuredActivityNode::structuredNodeOutput} (opposite A_result_conditionalNode::conditionalNode)
  // The OutputPins that onto which are moved values from the bodyOutputs of the Clause selected for execution.
}
