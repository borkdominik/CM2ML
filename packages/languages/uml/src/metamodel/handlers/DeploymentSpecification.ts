import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Deployment, DeploymentSpecification } from '../uml-metamodel'

export const DeploymentSpecificationHandler =
  DeploymentSpecification.createHandler(
    (deploymentSpecification, { onlyContainmentAssociations }) => {
      const deployment = resolve(deploymentSpecification, 'deployment', { type: Deployment })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_deployment(deploymentSpecification, deployment)
    },
    {
      [Uml.Attributes.deploymentLocation]: { type: 'string' },
      [Uml.Attributes.executionLocation]: { type: 'string' },
    },
  )

function addEdge_deployment(deploymentSpecification: GraphNode, deployment: GraphNode | undefined) {
  // deployment : Deployment [0..1]{subsets Element::owner} (opposite Deployment::configuration)
  // The deployment with which the DeploymentSpecification is associated.
  if (!deployment) {
    return
  }
  deploymentSpecification.model.addEdge('deployment', deploymentSpecification, deployment)
}
