import type { GraphNode } from '@cm2ml/ir'

import { DecisionNode } from '../uml-metamodel'

export const DecisionNodeHandler = DecisionNode.createHandler(
  (decisionNode, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_decisionInput(decisionNode)
    addEdge_decisionInputFlow(decisionNode)
  },
)

function addEdge_decisionInput(_decisionNode: GraphNode) {
  // TODO/Association
  // decisionInput : Behavior [0..1] (opposite A_decisionInput_decisionNode::decisionNode)
  // A Behavior that is executed to provide an input to guard ValueSpecifications on ActivityEdges outgoing from the DecisionNode.
}

function addEdge_decisionInputFlow(_decisionNode: GraphNode) {
  // TODO/Association
  // decisionInputFlow : ObjectFlow [0..1] (opposite A_decisionInputFlow_decisionNode::decisionNode)
  // An additional ActivityEdge incoming to the DecisionNode that provides a decision input value for the guards ValueSpecifications on ActivityEdges outgoing from the DecisionNode.
}
