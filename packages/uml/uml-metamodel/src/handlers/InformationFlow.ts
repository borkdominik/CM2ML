import type { GraphNode } from '@cm2ml/ir'

import { InformationFlow } from '../uml-metamodel'

export const InformationFlowHandler = InformationFlow.createHandler(
  (informationFlow, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_conveyed(informationFlow)
    addEdge_informationSource(informationFlow)
    addEdge_informationTarget(informationFlow)
    addEdge_realization(informationFlow)
    addEdge_realizingActivityEdge(informationFlow)
    addEdge_realizingConnector(informationFlow)
    addEdge_realizingMessage(informationFlow)
  },
)

function addEdge_conveyed(_informationFlow: GraphNode) {
  // TODO/Association
  // conveyed : Classifier [1..*] (opposite A_conveyed_conveyingFlow::conveyingFlow)
  // Specifies the information items that may circulate on this information flow.
}

function addEdge_informationSource(_informationFlow: GraphNode) {
  // TODO/Association
  // informationSource : NamedElement [1..*]{subsets DirectedRelationship::source} (opposite A_informationSource_informationFlow::informationFlow)
  // Defines from which source the conveyed InformationItems are initiated.
}

function addEdge_informationTarget(_informationFlow: GraphNode) {
  // TODO/Association
  // informationTarget : NamedElement [1..*]{subsets DirectedRelationship::target} (opposite A_informationTarget_informationFlow::informationFlow)
  // Defines to which target the conveyed InformationItems are directed.
}

function addEdge_realization(_informationFlow: GraphNode) {
  // TODO/Association
  // realization : Relationship [0..*] (opposite A_realization_abstraction_flow::abstraction)
  // Determines which Relationship will realize the specified flow.
}

function addEdge_realizingActivityEdge(_informationFlow: GraphNode) {
  // TODO/Association
  // realizingActivityEdge : ActivityEdge [0..*] (opposite A_realizingActivityEdge_informationFlow::informationFlow)
  // Determines which ActivityEdges will realize the specified flow.
}

function addEdge_realizingConnector(_informationFlow: GraphNode) {
  // TODO/Association
  // realizingConnector : Connector [0..*] (opposite A_realizingConnector_informationFlow::informationFlow)
  // Determines which Connectors will realize the specified flow.
}

function addEdge_realizingMessage(_informationFlow: GraphNode) {
  // TODO/Association
  // realizingMessage : Message [0..*] (opposite A_realizingMessage_informationFlow::informationFlow)
  // Determines which Messages will realize the specified flow.
}
