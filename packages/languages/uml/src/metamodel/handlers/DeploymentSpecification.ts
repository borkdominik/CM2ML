import type { GraphNode } from '@cm2ml/ir'

import { DeploymentSpecification } from '../uml-metamodel'

export const DeploymentSpecificationHandler =
  DeploymentSpecification.createHandler(
    (deploymentSpecification, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_deployment(deploymentSpecification)
    },
  )

function addEdge_deployment(_deploymentSpecification: GraphNode) {
  // TODO/Association
  // deployment : Deployment [0..1]{subsets Element::owner} (opposite Deployment::configuration)
  // The deployment with which the DeploymentSpecification is associated.
}
