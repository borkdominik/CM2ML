import type { GraphNode } from '@cm2ml/ir'

import { resolveFromChild } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Clause, ConditionalNode } from '../uml-metamodel'

export const ConditionalNodeHandler = ConditionalNode.createHandler(
  (conditionalNode, { onlyContainmentAssociations }) => {
    const clauses = resolveFromChild(conditionalNode, 'clause', { many: true, type: Clause })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_clause(conditionalNode, clauses)
    addEdge_result(conditionalNode)
  },
  {
    [Uml.Attributes.isAssured]: 'false',
    [Uml.Attributes.isDeterminate]: 'false',
  },
)

function addEdge_clause(conditionalNode: GraphNode, clauses: GraphNode[]) {
  // ♦ clause : Clause [1..*]{subsets Element::ownedElement} (opposite A_clause_conditionalNode::conditionalNode)
  // The set of Clauses composing the ConditionalNode.
  clauses.forEach((clause) => {
    conditionalNode.model.addEdge('clause', conditionalNode, clause)
  })
}

function addEdge_result(_conditionalNode: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [0..*]{ordered, redefines StructuredActivityNode::structuredNodeOutput} (opposite A_result_conditionalNode::conditionalNode)
  // The OutputPins that onto which are moved values from the bodyOutputs of the Clause selected for execution.
}
