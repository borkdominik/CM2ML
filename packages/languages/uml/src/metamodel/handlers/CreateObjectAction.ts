import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute, resolveFromChild } from '../resolvers/resolve'
import { CreateObjectAction, OutputPin } from '../uml-metamodel'

export const CreateObjectActionHandler = CreateObjectAction.createHandler(
  (createObjectAction, { onlyContainmentAssociations }) => {
    const classifier = resolveFromAttribute(createObjectAction, 'classifier')
    const result = resolveFromChild(createObjectAction, 'result', { type: OutputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_classifier(createObjectAction, classifier)
    addEdge_result(createObjectAction, result)
  },
)

function addEdge_classifier(createObjectAction: GraphNode, classifier: GraphNode | undefined) {
  // classifier : Classifier [1..1] (opposite A_classifier_createObjectAction::createObjectAction)
  // The Classifier to be instantiated.
  if (!classifier) {
    return
  }
  createObjectAction.model.addEdge('classifier', createObjectAction, classifier)
}

function addEdge_result(createObjectAction: GraphNode, result: GraphNode | undefined) {
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_createObjectAction::createObjectAction)
  // The OutputPin on which the newly created object is placed.
  if (!result) {
    return
  }
  createObjectAction.model.addEdge('result', createObjectAction, result)
}
