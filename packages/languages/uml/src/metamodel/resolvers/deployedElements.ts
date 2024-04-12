import type { GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { Artifact, DeploymentTarget } from '../uml-metamodel'

export function resolveDeployedElements(model: GraphModel, relationshipsAsEdges: boolean) {
  if (relationshipsAsEdges) {
    resolveDeployedElementsWithRelationshipsAsEdges(model)
  } else {
    resolveDeployedElementsWithRelationshipsAsNodes(model)
  }
}

function resolveDeployedElementsWithRelationshipsAsNodes(model: GraphModel) {
  Stream
    .from(model.nodes)
    .filter((node) => DeploymentTarget.isAssignable(node))
    .forEach((deploymentTarget) => {
      getDeploymentsNodesFromDeploymentTarget(deploymentTarget)
        .map(getDeployedArtifactFromDeploymentNode)
        .filterNonNull()
        .filter((deployedArtifact) => Artifact.isAssignable(deployedArtifact))
        .flatMap(getManifestationNodesFromArtifact)
        .map(getUtilizedElementFromManifestationNode)
        .filterNonNull()
        .distinct()
        .forEach((utilizedElement) => {
          model.addEdge('deployedElement', deploymentTarget, utilizedElement)
        })
    })
}

function getDeploymentsNodesFromDeploymentTarget(deploymentTarget: GraphNode) {
  return Stream
    .from(deploymentTarget.outgoingEdges)
    .filter((edge) => edge.tag === 'deployment')
    .map((edge) => edge.target)
}

function getDeployedArtifactFromDeploymentNode(deployment: GraphNode) {
  return Stream
    .from(deployment.outgoingEdges)
    .find((edge) => edge.tag === 'deployedArtifact')
    ?.target
}

function getManifestationNodesFromArtifact(deployedArtifact: GraphNode) {
  return Stream
    .from(deployedArtifact.outgoingEdges)
    .filter((edge) => edge.tag === 'manifestation')
    .filterNonNull()
    .map((edge) => edge.target)
}

function getUtilizedElementFromManifestationNode(manifestation: GraphNode) {
  return Stream
    .from(manifestation.outgoingEdges)
    .find((edge) => edge.tag === 'utilizedElement')
    ?.target
}

function resolveDeployedElementsWithRelationshipsAsEdges(model: GraphModel) {
  Stream
    .from(model.nodes)
    .filter((node) => DeploymentTarget.isAssignable(node))
    .forEach((deploymentTarget) => {
      getDeploymentEdgesFromDeploymentTarget(deploymentTarget)
        .map(getDeployedArtifactFromDeploymentEdge)
        .filter((deployedArtifact) => Artifact.isAssignable(deployedArtifact))
        .flatMap(getManifestationEdgesFromArtifact)
        .map(getUtilizedElementFromManifestationEdge)
        .distinct()
        .forEach((utilizedElement) => {
          model.addEdge('deployedElement', deploymentTarget, utilizedElement)
        })
    })
}

function getDeploymentEdgesFromDeploymentTarget(deploymentTarget: GraphNode) {
  return Stream
    .from(deploymentTarget.outgoingEdges)
    .filter((edge) => edge.tag === 'deployment')
}

function getDeployedArtifactFromDeploymentEdge(deployment: GraphEdge) {
  return deployment.target
}

function getManifestationEdgesFromArtifact(deployedArtifact: GraphNode) {
  return Stream
    .from(deployedArtifact.outgoingEdges)
    .filter((edge) => edge.tag === 'manifestation')
}

function getUtilizedElementFromManifestationEdge(manifestation: GraphEdge) {
  return manifestation.target
}
