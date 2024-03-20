import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Deployment, DeploymentTarget } from '../uml-metamodel'

export const DeploymentTargetHandler = DeploymentTarget.createHandler(
  (deploymentTarget, { onlyContainmentAssociations }) => {
    const deployments = resolve(deploymentTarget, 'deployment', { many: true, type: Deployment })
    addAttribute_deployment_client(deploymentTarget, deployments)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_deployedElement(deploymentTarget)
    addEdge_deployment(deploymentTarget, deployments)
  },
)

function addEdge_deployedElement(_deploymentTarget: GraphNode) {
  // TODO/Association
  // /deployedElement : PackageableElement [0..*]{} (opposite A_deployedElement_deploymentTarget::deploymentTarget)
  // The set of elements that are manifested in an Artifact that is involved in Deployment to a DeploymentTarget.

  // Source: deployment -> deployedArtifact -> filter is Artifact -> manifestation -> utilizedElement
}

function addEdge_deployment(deploymentTarget: GraphNode, deployments: GraphNode[]) {
  // ♦ deployment : Deployment [0..*]{subsets Element::ownedElement, subsets NamedElement::clientDependency} (opposite Deployment::location)
  // The set of Deployments for a DeploymentTarget.
  deployments.forEach((deployment) => {
    deploymentTarget.model.addEdge('deployment', deploymentTarget, deployment)
    deployment.model.addEdge('location', deployment, deploymentTarget)
  })
}

/**
 * This function sets a temporary client-attribute, which is consumed by the DependencyHandler
 */
function addAttribute_deployment_client(deploymentTarget: GraphNode, deployments: GraphNode[]) {
  const deploymentTargetId = deploymentTarget.id
  deployments.forEach((deployment) => {
    if (deploymentTargetId) {
      deployment.addAttribute({ name: 'client', value: { literal: deploymentTarget.id } })
    }
  })
}
