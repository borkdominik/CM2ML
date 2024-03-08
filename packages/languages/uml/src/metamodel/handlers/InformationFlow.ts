import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { transformNodeToEdgeCallback } from '../uml'
import { Classifier, Connector, InformationFlow, NamedElement } from '../uml-metamodel'

export const InformationFlowHandler = InformationFlow.createHandler(
  (informationFlow, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const conveyed = resolve(informationFlow, 'conveyed', { many: true, type: Classifier })
    const informationSources = resolve(informationFlow, 'informationSource', { many: true, type: NamedElement })
    const informationTargets = resolve(informationFlow, 'informationTarget', { many: true, type: NamedElement })
    const realizingConnectors = resolve(informationFlow, 'realizingConnector', { many: true, type: Connector })
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(informationFlow, informationSources, informationTargets)
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_conveyed(informationFlow, conveyed)
    addEdge_informationSource(informationFlow, informationSources)
    addEdge_informationTarget(informationFlow, informationTargets)
    addEdge_realization(informationFlow)
    addEdge_realizingActivityEdge(informationFlow)
    addEdge_realizingConnector(informationFlow, realizingConnectors)
    addEdge_realizingMessage(informationFlow)
  },
)

function addEdge_conveyed(informationFlow: GraphNode, conveyed: GraphNode[]) {
  // conveyed : Classifier [1..*] (opposite A_conveyed_conveyingFlow::conveyingFlow)
  // Specifies the information items that may circulate on this information flow.
  conveyed.forEach((classifier) => {
    informationFlow.model.addEdge('conveyed', informationFlow, classifier)
  })
}

function addEdge_informationSource(informationFlow: GraphNode, informationSources: GraphNode[]) {
  // informationSource : NamedElement [1..*]{subsets DirectedRelationship::source} (opposite A_informationSource_informationFlow::informationFlow)
  // Defines from which source the conveyed InformationItems are initiated.
  informationSources.forEach((namedElement) => {
    informationFlow.model.addEdge('informationSource', informationFlow, namedElement)
    informationFlow.model.addEdge('source', informationFlow, namedElement)
    informationFlow.model.addEdge('relatedElement', informationFlow, namedElement)
  })
}

function addEdge_informationTarget(informationFlow: GraphNode, informationTargets: GraphNode[]) {
  // informationTarget : NamedElement [1..*]{subsets DirectedRelationship::target} (opposite A_informationTarget_informationFlow::informationFlow)
  // Defines to which target the conveyed InformationItems are directed.
  informationTargets.forEach((namedElement) => {
    informationFlow.model.addEdge('informationTarget', informationFlow, namedElement)
    informationFlow.model.addEdge('target', informationFlow, namedElement)
    informationFlow.model.addEdge('relatedElement', informationFlow, namedElement)
  })
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

function addEdge_realizingConnector(informationFlow: GraphNode, realizingConnectors: GraphNode[]) {
  // realizingConnector : Connector [0..*] (opposite A_realizingConnector_informationFlow::informationFlow)
  // Determines which Connectors will realize the specified flow.
  realizingConnectors.forEach((connector) => {
    informationFlow.model.addEdge('realizingConnector', informationFlow, connector)
  })
}

function addEdge_realizingMessage(_informationFlow: GraphNode) {
  // TODO/Association
  // realizingMessage : Message [0..*] (opposite A_realizingMessage_informationFlow::informationFlow)
  // Determines which Messages will realize the specified flow.
}
