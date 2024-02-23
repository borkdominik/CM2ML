import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Pseudostate, StateMachine } from '../uml-metamodel'

export const StateMachineHandler = StateMachine.createHandler(
  (stateMachine, { onlyContainmentAssociations }) => {
    const connectionPoints = resolve(stateMachine, 'connectionPoint', { many: true, type: Pseudostate })
    const submachineStates = resolve(stateMachine, 'submachineState', { many: true })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_connectionPoint(stateMachine, connectionPoints)
    addEdge_extendedStateMachine(stateMachine)
    addEdge_region(stateMachine)
    addEdge_submachineState(stateMachine, submachineStates)
  },
)

function addEdge_connectionPoint(stateMachine: GraphNode, connectionPoints: GraphNode[]) {
  // ♦ connectionPoint : Pseudostate [0..*]{subsets Namespace::ownedMember} (opposite Pseudostate::stateMachine)
  // The connection points defined for this StateMachine. They represent the interface of the StateMachine when used as part of submachine State.
  connectionPoints.forEach((connectionPoint) => {
    stateMachine.model.addEdge('connectionPoint', stateMachine, connectionPoint)
  })
}

function addEdge_extendedStateMachine(_stateMachine: GraphNode) {
  // TODO/Association
  // extendedStateMachine : StateMachine [0..*]{redefines Behavior::redefinedBehavio
  // The StateMachines of which this is an extension.
}

function addEdge_region(_stateMachine: GraphNode) {
  // TODO/Association
  // ♦ region : Region [1..*]{subsets Namespace::ownedMember} (opposite Region::stateMachine)
  // The Regions owned directly by the StateMachine.
}

function addEdge_submachineState(stateMachine: GraphNode, submachineStates: GraphNode[]) {
  // submachineState : State [0..*] (opposite State::submachine)
  // References the submachine(s) in case of a submachine State. Multiple machines are referenced in case of a concurrent State.
  submachineStates.forEach((submachineState) => {
    stateMachine.model.addEdge('submachineState', stateMachine, submachineState)
  })
}
