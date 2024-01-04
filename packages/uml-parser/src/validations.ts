import type { GraphModel } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { HandlerConfiguration } from './metamodel/metamodel'
import { Relationship } from './metamodel/metamodel'

export function validateModel(
  model: GraphModel,
  configuration: HandlerConfiguration,
) {
  if (!model.settings.strict) {
    return
  }
  model.debug('Validating model')
  validateNodeIdentifiability(model)
  validateOnlyContainmentAssociations(model, configuration)
  validateRelationshipTransformation(model, configuration)
  validateEdgeUniqueness(model)
  model.debug('All validations passed')
}

function validateNodeIdentifiability(model: GraphModel) {
  model.nodes.forEach((node) => {
    if (!node.id) {
      throw new Error(`Node ${node.tag} has no id`)
    }
  })
}

function validateOnlyContainmentAssociations(
  model: GraphModel,
  { onlyContainmentAssociations, relationshipsAsEdges }: HandlerConfiguration,
) {
  if (!onlyContainmentAssociations) {
    return
  }
  model.edges.forEach((edge) => {
    if (relationshipsAsEdges && Relationship.isAssignable(edge)) {
      return
    }
    if (edge.tag !== 'owner' && edge.tag !== 'ownedElement') {
      throw new Error(
        `Edge ${edge.tag} from ${edge.source.id} to ${edge.target.id} is not a containment association`,
      )
    }
  })
}

function validateRelationshipTransformation(
  model: GraphModel,
  { relationshipsAsEdges }: HandlerConfiguration,
) {
  if (!relationshipsAsEdges) {
    return
  }
  model.nodes.forEach((node) => {
    if (Relationship.isAssignable(node)) {
      throw new Error(`Relationship ${node.show()} was not transformed to edge`)
    }
  })
}

function validateEdgeUniqueness(model: GraphModel) {
  model.nodes.forEach((node) => {
    node.outgoingEdges.forEach((edge) => {
      const equalEdges = Stream.from(node.outgoingEdges)
        .filter((e) => e.tag === edge.tag && e.target === edge.target)
        .toArray()
      if (equalEdges.length > 1) {
        throw new Error(
          `Node ${node.id} has duplicate outgoing edges with tag ${edge.tag} and target ${edge.target.id}`,
        )
      }
    })
  })
}
