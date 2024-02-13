import type { GraphNode } from '@cm2ml/ir'

import { ProtocolTransition } from '../uml-metamodel'

export const ProtocolTransitionHandler = ProtocolTransition.createHandler(
  (protocolTransition, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_postCondition(protocolTransition)
    addEdge_preCondition(protocolTransition)
    addEdge_referred(protocolTransition)
  },
)

function addEdge_postCondition(_protocolTransition: GraphNode) {
  // TODO/Association
  // ♦ postCondition : Constraint [0..1]{subsets Namespace::ownedRule} (opposite A_postCondition_owningTransition::owningTransition)
  // Specifies the post condition of the Transition which is the Condition that should be obtained once the Transition is triggered. This post condition is part of the post condition of the Operation connected to the Transition.
}

function addEdge_preCondition(_protocolTransition: GraphNode) {
  // TODO/Association
  // ♦ preCondition : Constraint [0..1]{subsets Transition::guard} (opposite A_preCondition_protocolTransition::protocolTransition)
  // Specifies the precondition of the Transition. It specifies the Condition that should be verified before triggering the Transition. This guard condition added to the source State will be evaluated as part of the precondition of the Operation referred by the Transition if any.
}

function addEdge_referred(_protocolTransition: GraphNode) {
  // TODO/Association
  // /referred : Operation [0..*]{} (opposite A_referred_protocolTransition::protocolTransition)
  // This association refers to the associated Operation. It is derived from the Operation of the CallEvent Trigger when applicable.
}
