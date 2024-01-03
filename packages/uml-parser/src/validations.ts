import type { GraphModel } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { Relationship } from './metamodel/metamodel'

export function validateModel(
  model: GraphModel,
  relationshipsAsEdges: boolean,
) {
  if (!model.settings.strict) {
    return
  }
  model.debug('Validating model')
  validateNodeIdentifiability(model)
  validateRelationshipTransformation(model, relationshipsAsEdges)
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

function validateRelationshipTransformation(
  model: GraphModel,
  relationshipsAsEdges: boolean,
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
