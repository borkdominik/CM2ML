import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Classifier, InformationItem } from '../uml-metamodel'

export const InformationItemHandler = InformationItem.createHandler(
  (informationItem, { onlyContainmentAssociations }) => {
    const represented = resolve(informationItem, 'represented', { many: true, type: Classifier })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_represented(informationItem, represented)
  },
)

function addEdge_represented(informationItem: GraphNode, represented: GraphNode[]) {
  // represented : Classifier [0..*] (opposite A_represented_representation::representation)
  // Determines the classifiers that will specify the structure and nature of the information. An information item represents all its represented classifiers.
  represented.forEach((classifier) => {
    informationItem.model.addEdge('represented', informationItem, classifier)
  })
}
