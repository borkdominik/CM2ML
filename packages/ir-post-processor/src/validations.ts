import type { GraphModel } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

export function validateModel(model: GraphModel) {
  if (!model.settings.strict) {
    return
  }
  model.debug('Validating model')
  validateNodeIdentifiability(model)
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
