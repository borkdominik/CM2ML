import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { OutputPin, ReadExtentAction } from '../uml-metamodel'

export const ReadExtentActionHandler = ReadExtentAction.createHandler(
  (readExtentAction, { onlyContainmentAssociations }) => {
    const result = resolve(readExtentAction, 'result', { type: OutputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_classifier(readExtentAction)
    addEdge_result(readExtentAction, result)
  },
)
function addEdge_classifier(_readExtentAction: GraphNode) {
  // TODO/Association
  // classifier : Classifier [1..1] (opposite A_classifier_readExtentAction::readExtentAction)
  // The Classifier whose instances are to be retrieved.
}

function addEdge_result(readExtentAction: GraphNode, result: GraphNode | undefined) {
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_readExtentAction::readExtentAction)
  // The OutputPin on which the Classifier instances are placed.
  if (!result) {
    return
  }
  readExtentAction.model.addEdge('result', readExtentAction, result)
}
