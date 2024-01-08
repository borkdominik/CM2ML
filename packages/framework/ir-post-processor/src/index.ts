import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { validateModel } from './validations'

export const IrPostProcessor = definePlugin({
  name: 'ir-post-processor',
  parameters: {
    removeInvalidNodes: {
      type: 'boolean',
      defaultValue: true,
      description:
        'Remove unconnected or unidentifiable nodes from the graph. Has no effect if model is strict.',
    },
  },
  invoke: (model: GraphModel, { removeInvalidNodes }) => {
    if (removeInvalidNodes && !model.settings.strict) {
      removeInvalidNodesFromModel(model)
    }
    validateModel(model)
    return model
  },
})

function removeInvalidNodesFromModel(model: GraphModel) {
  Stream.from(model.nodes)
    .filter(isNodeInvalid)
    .forEach((node) => {
      model.removeNode(node)
    })
}

function isNodeInvalid(node: GraphNode) {
  function isNodeUnconnected() {
    return node.incomingEdges.size === 0 && node.outgoingEdges.size === 0
  }
  function isNodeUnidentifiable() {
    return node.id === undefined
  }
  if (node === node.model.root) {
    return false
  }
  return isNodeUnconnected() || isNodeUnidentifiable()
}
