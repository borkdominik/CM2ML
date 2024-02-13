import type { GraphNode } from '@cm2ml/ir'

import { State } from '../uml-metamodel'

export const StateHandler = State.createHandler(
  (state, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_connection(state)
    addEdge_connectionPoint(state)
    addEdge_deferrableTrigger(state)
    addEdge_doActivity(state)
    addEdge_entry(state)
    addEdge_exit(state)
    addEdge_region(state)
    addEdge_stateInvariant(state)
    addEdge_submachine(state)
  },
)

function addEdge_connection(_state: GraphNode) {
  // TODO/Association
  // ♦ connection : ConnectionPointReference [0..*]{subsets Namespace::ownedMember} (opposite ConnectionPointReference::state)
  // The entry and exit connection points used in conjunction with this (submachine) State, i.e., as targets and sources, respectively, in the Region with the submachine State. A connection point reference references the corresponding definition of a connection point Pseudostate in the StateMachine referenced by the submachine State.
}

function addEdge_connectionPoint(_state: GraphNode) {
  // TODO/Association
  // ♦ connectionPoint : Pseudostate [0..*]{subsets Namespace::ownedMember} (opposite Pseudostate::state)
  // The entry and exit Pseudostates of a composite State. These can only be entry or exit Pseudostates, and they must have different names. They can only be defined for composite States.
}

function addEdge_deferrableTrigger(_state: GraphNode) {
  // TODO/Association
  // ♦ deferrableTrigger : Trigger [0..*]{subsets Element::ownedElement} (opposite A_deferrableTrigger_state::state)
  // A list of Triggers that are candidates to be retained by the StateMachine if they trigger no Transitions out of the State (not consumed). A deferred Trigger is retained until the StateMachine reaches a State configuration where it is no longer deferred.
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

function addEdge_region(_state: GraphNode) {
  // TODO/Association
  // ♦ region : Region [0..*]{subsets Namespace::ownedMember} (opposite Region::state)
  // The Regions owned directly by the State.
}

function addEdge_stateInvariant(_state: GraphNode) {
  // TODO/Association
  // ♦ stateInvariant : Constraint [0..1]{subsets Namespace::ownedRule} (opposite A_stateInvariant_owningState::owningState)
  // Specifies conditions that are always true when this State is the current State. In ProtocolStateMachines state invariants are additional conditions to the preconditions of the outgoing Transitions, and to the postcondition of the incoming Transitions.
}

function addEdge_submachine(_state: GraphNode) {
  // TODO/Association
  // submachine : StateMachine [0..1] (opposite StateMachine::submachineState)
  // The StateMachine that is to be inserted in place of the (submachine) State.
}
