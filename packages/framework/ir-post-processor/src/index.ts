import type { GraphModel, GraphNode, ModelMember } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

import { validateModel } from './validations'

const TAG_ATTRIBUTE_NAME = 'eu.yeger.tag'

export const IrPostProcessor = definePlugin({
  name: 'ir-post-processor',
  parameters: {
    nodeTagAsAttribute: {
      type: 'boolean',
      description: 'Include node tags as an attribute.',
      defaultValue: false,
      group: 'attributes',
    },
    edgeTagAsAttribute: {
      type: 'boolean',
      description: 'Include edge tags as an attribute.',
      defaultValue: false,
      group: 'attributes',
    },
    unifyTypes: {
      type: 'boolean',
      description: 'Unify all types to a single type.',
      defaultValue: false,
      group: 'attributes',
    },
  },
  invoke: (model: GraphModel, parameters) => {
    if (!model.settings.strict) {
      removeInvalidNodesFromModel(model)
    }
    if (parameters.nodeTagAsAttribute) {
      model.nodes.forEach((node) => {
        node.addAttribute({ name: TAG_ATTRIBUTE_NAME, type: 'category', value: { literal: node.tag } })
      })
    }
    if (parameters.edgeTagAsAttribute) {
      model.edges.forEach((edge) => {
        edge.addAttribute({ name: TAG_ATTRIBUTE_NAME, type: 'category', value: { literal: edge.tag } })
      })
    }
    if (parameters.unifyTypes) {
      Stream.from<ModelMember>(model.nodes).concat(model.edges).forEach((member) => {
        const type = member.type
        if (type === undefined) {
          return
        }
        model.metamodel.typeAttributes.forEach((typeAttribute) => {
          member.removeAttribute(typeAttribute)
        })
        member.type = type
      })
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
