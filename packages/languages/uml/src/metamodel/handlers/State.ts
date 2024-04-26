import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { ConnectionPointReference, Constraint, Pseudostate, Region, State, StateMachine, Trigger } from '../uml-metamodel'

export const StateHandler = State.createHandler(
  (state, { onlyContainmentAssociations }) => {
    const connectionPoints = resolve(state, 'connectionPoint', { many: true, type: Pseudostate })
    const connections = resolve(state, 'connection', { many: true, type: ConnectionPointReference })
    const deferrableTriggers = resolve(state, 'deferrableTrigger', { many: true, type: Trigger })
    const redefinedStates = resolve(state, 'redefinedState', { many: true, type: State })
    const regions = resolve(state, 'region', { many: true, type: Region })
    const stateInvariant = resolve(state, 'stateInvariant', { type: Constraint })
    const submachine = resolve(state, 'submachine', { type: StateMachine })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_connection(state, connections)
    addEdge_connectionPoint(state, connectionPoints)
    addEdge_deferrableTrigger(state, deferrableTriggers)
    addEdge_doActivity(state)
    addEdge_entry(state)
    addEdge_exit(state)
    addEdge_redefinedElement(state, redefinedStates)
    addEdge_region(state, regions)
    addEdge_stateInvariant(state, stateInvariant)
    addEdge_submachine(state, submachine)
  },
  {
    [Uml.Attributes.isComposite]: { type: 'boolean' },
    [Uml.Attributes.isOrthogonal]: { type: 'boolean' },
    [Uml.Attributes.isSimple]: { type: 'boolean' },
    [Uml.Attributes.isSubmachineState]: { type: 'boolean' },
  },
)

function addEdge_connection(state: GraphNode, connections: GraphNode[]) {
  // ♦ connection : ConnectionPointReference [0..*]{subsets Namespace::ownedMember} (opposite ConnectionPointReference::state)
  // The entry and exit connection points used in conjunction with this (submachine) State, i.e., as targets and sources, respectively, in the Region with the submachine State. A connection point reference references the corresponding definition of a connection point Pseudostate in the StateMachine referenced by the submachine State.
  connections.forEach((connection) => {
    state.model.addEdge('connection', state, connection)
  })
}

function addEdge_connectionPoint(state: GraphNode, connectionPoints: GraphNode[]) {
  // ♦ connectionPoint : Pseudostate [0..*]{subsets Namespace::ownedMember} (opposite Pseudostate::state)
  // The entry and exit Pseudostates of a composite State. These can only be entry or exit Pseudostates, and they must have different names. They can only be defined for composite States.
  connectionPoints.forEach((connectionPoint) => {
    state.model.addEdge('connectionPoint', state, connectionPoint)
  })
}

function addEdge_deferrableTrigger(state: GraphNode, deferrableTriggers: GraphNode[]) {
  // ♦ deferrableTrigger : Trigger [0..*]{subsets Element::ownedElement} (opposite A_deferrableTrigger_state::state)
  // A list of Triggers that are candidates to be retained by the StateMachine if they trigger no Transitions out of the State (not consumed). A deferred Trigger is retained until the StateMachine reaches a State configuration where it is no longer deferred.
  deferrableTriggers.forEach((deferrableTrigger) => {
    state.model.addEdge('deferrableTrigger', state, deferrableTrigger)
  })
}

function addEdge_doActivity(_state: GraphNode) {
  // TODO/Association
  // ♦ doActivity : Behavior [0..1]{subsets Element::ownedElement} (opposite A_doActivity_state::state)
  // An optional Behavior that is executed while being in the State. The execution starts when this State is entered, and ceases either by itself when done, or when the State is exited, whichever comes first.
}

function addEdge_entry(_state: GraphNode) {
  // TODO/Association
  // ♦ entry : Behavior [0..1]{subsets Element::ownedElement} (opposite A_entry_state::state)
  // An optional Behavior that is executed whenever this State is entered regardless of the Transition taken to reach the State. If defined, entry Behaviors are always executed to completion prior to any internal Behavior or Transitions performed within the State.
}

function addEdge_exit(_state: GraphNode) {
  // TODO/Association
  // ♦ exit : Behavior [0..1]{subsets Element::ownedElement} (opposite A_exit_state::state)
  // An optional Behavior that is executed whenever this State is exited regardless of which Transition was taken out of the State. If defined, exit Behaviors are always executed to completion only after all internal and transition Behaviors have completed execution.
}

function addEdge_redefinedElement(state: GraphNode, redefinedStates: GraphNode[]) {
  // See RedefinedElementHandler
  redefinedStates.forEach((redefinedState) => {
    state.model.addEdge('redefinedElement', state, redefinedState)
  })
}

function addEdge_region(state: GraphNode, regions: GraphNode[]) {
  // ♦ region : Region [0..*]{subsets Namespace::ownedMember} (opposite Region::state)
  // The Regions owned directly by the State.
  regions.forEach((region) => {
    state.model.addEdge('region', state, region)
  })
}

function addEdge_stateInvariant(state: GraphNode, stateInvariant: GraphNode | undefined) {
  // ♦ stateInvariant : Constraint [0..1]{subsets Namespace::ownedRule} (opposite A_stateInvariant_owningState::owningState)
  // Specifies conditions that are always true when this State is the current State. In ProtocolStateMachines state invariants are additional conditions to the preconditions of the outgoing Transitions, and to the postcondition of the incoming Transitions.
  if (!stateInvariant) {
    return
  }
  state.model.addEdge('stateInvariant', state, stateInvariant)
}

function addEdge_submachine(state: GraphNode, submachine: GraphNode | undefined) {
  // submachine : StateMachine [0..1] (opposite StateMachine::submachineState)
  // The StateMachine that is to be inserted in place of the (submachine) State.
  if (!submachine) {
    return
  }
  state.model.addEdge('submachine', state, submachine)
}
