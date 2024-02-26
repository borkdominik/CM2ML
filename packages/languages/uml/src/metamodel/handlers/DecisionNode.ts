import type { GraphNode } from '@cm2ml/ir'

import { resolve, resolveFromAttribute } from '../resolvers/resolve'
import { Behavior, DecisionNode, ObjectFlow } from '../uml-metamodel'

export const DecisionNodeHandler = DecisionNode.createHandler(
  (decisionNode, { onlyContainmentAssociations }) => {
    const decisionInput = resolve(decisionNode, 'decisionInput', { type: Behavior })
    const decisionInputFlow = resolveFromAttribute(decisionNode, 'decisionInputFlow', { type: ObjectFlow })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_decisionInput(decisionNode, decisionInput)
    addEdge_decisionInputFlow(decisionNode, decisionInputFlow)
  },
)

function addEdge_decisionInput(decisionNode: GraphNode, decisionInput: GraphNode | undefined) {
  // decisionInput : Behavior [0..1] (opposite A_decisionInput_decisionNode::decisionNode)
  // A Behavior that is executed to provide an input to guard ValueSpecifications on ActivityEdges outgoing from the DecisionNode.
  if (!decisionInput) {
    return
  }
  decisionNode.model.addEdge('decisionInput', decisionNode, decisionInput)
}

function addEdge_decisionInputFlow(decisionNode: GraphNode, decisionInputFlow: GraphNode | undefined) {
  // decisionInputFlow : ObjectFlow [0..1] (opposite A_decisionInputFlow_decisionNode::decisionNode)
  // An additional ActivityEdge incoming to the DecisionNode that provides a decision input value for the guards ValueSpecifications on ActivityEdges outgoing from the DecisionNode.
  if (!decisionInputFlow) {
    return
  }
  decisionNode.model.addEdge('decisionInputFlow', decisionNode, decisionInputFlow)
}
