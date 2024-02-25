import type { GraphNode } from '@cm2ml/ir'

import { resolve, resolveFromAttribute } from '../resolvers/resolve'
import { Clause, ExecutableNode, OutputPin } from '../uml-metamodel'

export const ClauseHandler = Clause.createHandler(
  (clause, { onlyContainmentAssociations }) => {
    const bodies = resolve(clause, 'body', { many: true, type: ExecutableNode })
    const bodyOutputs = resolve(clause, 'bodyOutput', { many: true, type: OutputPin })
    const decider = resolveFromAttribute(clause, 'decider')
    const predecessorClauses = resolveFromAttribute(clause, 'predecessorClause', { many: true })
    const successorClauses = resolveFromAttribute(clause, 'successorClause', { many: true })
    const tests = resolveFromAttribute(clause, 'test', { many: true })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_body(clause, bodies)
    addEdge_bodyOutput(clause, bodyOutputs)
    addEdge_decider(clause, decider)
    addEdge_predecessorClause(clause, predecessorClauses)
    addEdge_successorClause(clause, successorClauses)
    addEdge_test(clause, tests)
  },
)

function addEdge_body(clause: GraphNode, bodies: GraphNode[]) {
  // body : ExecutableNode [0..*] (opposite A_body_clause::clause)
  // The set of ExecutableNodes that are executed if the test evaluates to true and the Clause is chosen over other Clauses within the ConditionalNode that also have tests that evaluate to true.
  bodies.forEach((body) => {
    clause.model.addEdge('body', clause, body)
  })
}

function addEdge_bodyOutput(clause: GraphNode, bodyOutputs: GraphNode[]) {
  // bodyOutput : OutputPin [0..*]{ordered} (opposite A_bodyOutput_clause::clause)
  // The OutputPins on Actions within the body section whose values are moved to the result OutputPins of the containing ConditionalNode after execution of the body.
  bodyOutputs.forEach((bodyOutput) => {
    clause.model.addEdge('bodyOutput', clause, bodyOutput)
  })
}

function addEdge_decider(clause: GraphNode, decider: GraphNode | undefined) {
  // decider : OutputPin [1..1] (opposite A_decider_clause::clause)
  // An OutputPin on an Action in the test section whose Boolean value determines the result of the test.
  if (!decider) {
    return
  }
  clause.model.addEdge('decider', clause, decider)
}

function addEdge_predecessorClause(clause: GraphNode, predecessorClauses: GraphNode[]) {
  // predecessorClause : Clause [0..*] (opposite Clause::successorClause)
  // A set of Clauses whose tests must all evaluate to false before this Clause can evaluate its test.
  predecessorClauses.forEach((predecessorClause) => {
    clause.model.addEdge('predecessorClause', clause, predecessorClause)
  })
}

function addEdge_successorClause(clause: GraphNode, successorClauses: GraphNode[]) {
  // successorClause : Clause [0..*] (opposite Clause::predecessorClause)
  // A set of Clauses that may not evaluate their tests unless the test for this Clause evaluates to false.
  successorClauses.forEach((successorClause) => {
    clause.model.addEdge('successorClause', clause, successorClause)
  })
}

function addEdge_test(clause: GraphNode, tests: GraphNode[]) {
  // test : ExecutableNode [1..*] (opposite A_test_clause::clause)
  // The set of ExecutableNodes that are executed in order to provide a test result for the Clause.
  tests.forEach((test) => {
    clause.model.addEdge('test', clause, test)
  })
}
