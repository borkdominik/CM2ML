import type { GraphNode } from '@cm2ml/ir'

import { InformationItem } from '../uml-metamodel'

export const InformationItemHandler = InformationItem.createHandler(
  (informationItem, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_represented(informationItem)
  },
)

function addEdge_represented(_informationItem: GraphNode) {
  // TODO/Association
  // represented : Classifier [0..*] (opposite A_represented_representation::representation)
  // Determines the classifiers that will specify the structure and nature of the information. An information item represents all its represented classifiers.
}
