import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { DeployedArtifact, Deployment, DeploymentSpecification } from '../uml-metamodel'

export const DeploymentHandler = Deployment.createHandler(
  (deployment, { onlyContainmentAssociations }) => {
    const configurations = resolve(deployment, 'configuration', { many: true, type: DeploymentSpecification })
    const deployedArtifacts = resolve(deployment, 'deployedArtifact', { many: true, type: DeployedArtifact })
    addAttribute_supplier(deployment, deployedArtifacts)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_configuration(deployment, configurations)
    addEdge_deployedArtifact(deployment, deployedArtifacts)
    addEdge_location(deployment)
  },
)

function addEdge_configuration(deployment: GraphNode, configurations: GraphNode[]) {
  // ♦ configuration : DeploymentSpecification [0..*]{subsets Element::ownedElement} (opposite DeploymentSpecification::deployment)
  // The specification of properties that parameterize the deployment and execution of one or more Artifacts.
  configurations.forEach((configuration) => {
    deployment.model.addEdge('configuration', deployment, configuration)
  })
}

function addEdge_deployedArtifact(deployment: GraphNode, deployedArtifacts: GraphNode[]) {
  // deployedArtifact : DeployedArtifact [0..*]{subsets Dependency::supplier} (opposite A_deployedArtifact_deploymentForArtifact::deploymentForArtifact)
  // The Artifacts that are deployed onto a Node. This association specializes the supplier association.
  deployedArtifacts.forEach((deployedArtifact) => {
    deployment.model.addEdge('deployedArtifact', deployment, deployedArtifact)
  })
}

/**
 * This function sets a temporary supplier-attribute, which is consumed by the DependencyHandler
 */
function addAttribute_supplier(deployment: GraphNode, deployedArtifacts: GraphNode[]) {
  deployedArtifacts.forEach((deployedArtifact) => {
    const deployedArtifactId = deployedArtifact.id
    if (deployedArtifactId && deployment.getAttribute('supplier') === undefined) {
      deployment.addAttribute({ name: 'supplier', type: 'unknown', value: { literal: deployedArtifact.id } })
    }
  })
}

function addEdge_location(_deployment: GraphNode) {
  // location : DeploymentTarget [1..1]{subsets Dependency::client, subsets Element::owner} (opposite DeploymentTarget::deployment)
  // The DeployedTarget which is the target of a Deployment.

  // Added by DeploymentTargetHandler::addEdge_deployment
}
