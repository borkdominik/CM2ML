import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Pseudostate, Region, State, StateMachine } from '../uml-metamodel'

export const StateMachineHandler = StateMachine.createHandler(
  (stateMachine, { onlyContainmentAssociations }) => {
    const connectionPoints = resolve(stateMachine, 'connectionPoint', { many: true, type: Pseudostate })
    const extendedStateMachines = resolve(stateMachine, 'extendedStateMachine', { many: true, type: StateMachine })
    const regions = resolve(stateMachine, 'region', { many: true, type: Region })
    const submachineStates = resolve(stateMachine, 'submachineState', { many: true, type: State })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_connectionPoint(stateMachine, connectionPoints)
    addEdge_extendedStateMachine(stateMachine, extendedStateMachines)
    addEdge_region(stateMachine, regions)
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

function addEdge_extendedStateMachine(stateMachine: GraphNode, extendedStateMachines: GraphNode[]) {
  // extendedStateMachine : StateMachine [0..*]{redefines Behavior::redefinedBehavio
  // The StateMachines of which this is an extension.
  extendedStateMachines.forEach((extendedStateMachine) => {
    stateMachine.model.addEdge('extendedStateMachine', stateMachine, extendedStateMachine)
  })
}

function addEdge_region(stateMachine: GraphNode, regions: GraphNode[]) {
  // ♦ region : Region [1..*]{subsets Namespace::ownedMember} (opposite Region::stateMachine)
  // The Regions owned directly by the StateMachine.
  regions.forEach((region) => {
    stateMachine.model.addEdge('region', stateMachine, region)
  })
}

function addEdge_submachineState(stateMachine: GraphNode, submachineStates: GraphNode[]) {
  // submachineState : State [0..*] (opposite State::submachine)
  // References the submachine(s) in case of a submachine State. Multiple machines are referenced in case of a concurrent State.
  submachineStates.forEach((submachineState) => {
    stateMachine.model.addEdge('submachineState', stateMachine, submachineState)
  })
}
