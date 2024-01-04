import type { GraphNode } from '@cm2ml/ir'

import { DeploymentTarget } from '../metamodel'

export const DeploymentTargetHandler = DeploymentTarget.createHandler(
  (deploymentTarget, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_deployedElement(deploymentTarget)
    addEdge_deployment(deploymentTarget)
  },
)

function addEdge_deployedElement(_deploymentTarget: GraphNode) {
  // TODO
  // /deployedElement : PackageableElement [0..*]{} (opposite A_deployedElement_deploymentTarget::deploymentTarget)
  // The set of elements that are manifested in an Artifact that is involved in Deployment to a DeploymentTarget.
}

function addEdge_deployment(_deploymentTarget: GraphNode) {
  // TODO
  // ♦ deployment : Deployment [0..*]{subsets Element::ownedElement, subsets NamedElement::clientDependency} (opposite Deployment::location)
  // The set of Deployments for a DeploymentTarget.
}
