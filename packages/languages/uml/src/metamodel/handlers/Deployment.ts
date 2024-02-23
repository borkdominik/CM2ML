import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Deployment } from '../uml-metamodel'

export const DeploymentHandler = Deployment.createHandler(
  (deployment, { onlyContainmentAssociations }) => {
    const deployedArtifacts = resolveFromAttribute(deployment, 'deployedArtifact', { many: true })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_configuration(deployment)
    addEdge_deployedArtifact(deployment, deployedArtifacts)
    addEdge_location(deployment)
  },
)

function addEdge_configuration(_deployment: GraphNode) {
  // TODO/Association
  // ♦ configuration : DeploymentSpecification [0..*]{subsets Element::ownedElement} (opposite DeploymentSpecification::deployment)
  // The specification of properties that parameterize the deployment and execution of one or more Artifacts.
}

function addEdge_deployedArtifact(deployment: GraphNode, deployedArtifacts: GraphNode[]) {
  // deployedArtifact : DeployedArtifact [0..*]{subsets Dependency::supplier} (opposite A_deployedArtifact_deploymentForArtifact::deploymentForArtifact)
  // The Artifacts that are deployed onto a Node. This association specializes the supplier association.
  deployedArtifacts.forEach((deployedArtifact) => {
    deployment.model.addEdge('deployedArtifact', deployment, deployedArtifact)
  })
}

function addEdge_location(_deployment: GraphNode) {
  // TODO/Association
  // location : DeploymentTarget [1..1]{subsets Dependency::client, subsets Element::owner} (opposite DeploymentTarget::deployment)
  // The DeployedTarget which is the target of a Deployment.
}
