import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Classifier, ReadIsClassifiedObjectAction } from '../uml-metamodel'

export const ReadIsClassifiedObjectActionHandler =
  ReadIsClassifiedObjectAction.createHandler(
    (readIsClassifiedObjectAction, { onlyContainmentAssociations }) => {
      const classifier = resolve(readIsClassifiedObjectAction, 'classifier', { type: Classifier })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_classifier(readIsClassifiedObjectAction, classifier)
      addEdge_object(readIsClassifiedObjectAction)
      addEdge_result(readIsClassifiedObjectAction)
    },
    {
      [Uml.Attributes.isDirect]: 'false',
    },
  )

function addEdge_classifier(readIsClassifiedObjectAction: GraphNode, classifier: GraphNode | undefined) {
  // classifier : Classifier [1..1] (opposite A_classifier_readIsClassifiedObjectAction::readIsClassifiedObjectAction)
  // The Classifier against which the classification of the input object is tested.
  if (!classifier) {
    return
  }
  readIsClassifiedObjectAction.model.addEdge('classifier', readIsClassifiedObjectAction, classifier)
}

function addEdge_object(_readIsClassifiedObjectAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_readIsClassifiedObjectAction::readIsClassifiedObjectAction)
  // The InputPin that holds the object whose classification is to be tested.
}

function addEdge_result(_readIsClassifiedObjectAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_readIsClassifiedObjectAction::readIsClassifiedObjectAction)
  // The OutputPin that holds the Boolean result of the test.
}
