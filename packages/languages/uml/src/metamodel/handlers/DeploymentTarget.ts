import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Deployment, DeploymentTarget } from '../uml-metamodel'

export const DeploymentTargetHandler = DeploymentTarget.createHandler(
  (deploymentTarget, { onlyContainmentAssociations }) => {
    const deployment = resolve(deploymentTarget, 'deployment', { type: Deployment })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_deployedElement(deploymentTarget)
    addEdge_deployment(deploymentTarget, deployment)
  },
)

function addEdge_deployedElement(_deploymentTarget: GraphNode) {
  // TODO/Association
  // /deployedElement : PackageableElement [0..*]{} (opposite A_deployedElement_deploymentTarget::deploymentTarget)
  // The set of elements that are manifested in an Artifact that is involved in Deployment to a DeploymentTarget.
}

function addEdge_deployment(deploymentTarget: GraphNode, deployment: GraphNode | undefined) {
  // ♦ deployment : Deployment [0..*]{subsets Element::ownedElement, subsets NamedElement::clientDependency} (opposite Deployment::location)
  // The set of Deployments for a DeploymentTarget.
  if (!deployment) {
    return
  }
  deploymentTarget.model.addEdge('deployment', deploymentTarget, deployment)
}
