import type { Attributable, GraphModel } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

export function validateModel(model: GraphModel) {
  if (!model.settings.strict || !model.settings.debug) {
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
      const possibleDuplicateEdges = Stream.from(node.outgoingEdges)
        .filter((e) => e.tag === edge.tag && e.target === edge.target)
        .toArray()

      const allEdgesAreUnique = possibleDuplicateEdges.every((first) => {
        // check that at least one attribute differs
        return possibleDuplicateEdges.every((second) => {
          if (first === second) {
            return true
          }
          return !areAttributesEqual(first, second)
        })
      })
      if (!allEdgesAreUnique) {
        throw new Error(
            `Node ${node.id} has duplicate outgoing edges with tag ${edge.tag} and target ${edge.target.id}`,
        )
      }
    })
  })
}

function areAttributesEqual(first: Attributable, second: Attributable) {
  if (first.attributes.size !== second.attributes.size) {
    return false
  }
  return [...first.attributes.entries()].every(([name, firstAttribute]) => {
    const secondAttribute = second.attributes.get(name)
    if (!secondAttribute) {
      return false
    }
    return firstAttribute.value.literal === secondAttribute.value.literal
  })
}
