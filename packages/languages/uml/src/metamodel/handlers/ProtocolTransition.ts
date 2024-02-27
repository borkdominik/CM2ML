import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Constraint, ProtocolTransition } from '../uml-metamodel'

export const ProtocolTransitionHandler = ProtocolTransition.createHandler(
  (protocolTransition, { onlyContainmentAssociations }) => {
    const postCondition = resolve(protocolTransition, 'postCondition', { type: Constraint })
    const preCondition = resolve(protocolTransition, 'preCondition', { type: Constraint })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_postCondition(protocolTransition, postCondition)
    addEdge_preCondition(protocolTransition, preCondition)
    addEdge_referred(protocolTransition)
  },
)

function addEdge_postCondition(protocolTransition: GraphNode, postCondition: GraphNode | undefined) {
  // ♦ postCondition : Constraint [0..1]{subsets Namespace::ownedRule} (opposite A_postCondition_owningTransition::owningTransition)
  // Specifies the post condition of the Transition which is the Condition that should be obtained once the Transition is triggered. This post condition is part of the post condition of the Operation connected to the Transition.
  if (!postCondition) {
    return
  }
  protocolTransition.model.addEdge('postCondition', protocolTransition, postCondition)
}

function addEdge_preCondition(protocolTransition: GraphNode, preCondition: GraphNode | undefined) {
  // ♦ preCondition : Constraint [0..1]{subsets Transition::guard} (opposite A_preCondition_protocolTransition::protocolTransition)
  // Specifies the precondition of the Transition. It specifies the Condition that should be verified before triggering the Transition. This guard condition added to the source State will be evaluated as part of the precondition of the Operation referred by the Transition if any.
  if (!preCondition) {
    return
  }
  protocolTransition.model.addEdge('preCondition', protocolTransition, preCondition)
}

function addEdge_referred(_protocolTransition: GraphNode) {
  // TODO/Association
  // /referred : Operation [0..*]{} (opposite A_referred_protocolTransition::protocolTransition)
  // This association refers to the associated Operation. It is derived from the Operation of the CallEvent Trigger when applicable.
}
