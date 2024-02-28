import type { GraphModel, GraphNode } from '@cm2ml/ir'

import { Uml } from './uml'
import type { UmlHandlerParameters } from './uml-metamodel'
import { Relationship } from './uml-metamodel'

export function validateUmlModel(
  model: GraphModel,
  handlerParameters: UmlHandlerParameters,
) {
  if (!model.settings.strict || !model.settings.debug) {
    return
  }
  model.debug('Parser', 'Validating UML model')
  validateOnlyContainmentAssociations(model, handlerParameters)
  validateRelationshipTransformation(model, handlerParameters)
  allAttributesAreKnown(model)
  model.debug('Parser', 'All UML validations passed')
}

function validateOnlyContainmentAssociations(
  model: GraphModel,
  { onlyContainmentAssociations, relationshipsAsEdges }: UmlHandlerParameters,
) {
  if (!onlyContainmentAssociations) {
    return
  }
  const whitelistedEdges = new Set(['owner', 'ownedElement', 'protocolTransition', 'transition'])
  model.edges.forEach((edge) => {
    if (relationshipsAsEdges && Relationship.isAssignable(edge)) {
      return
    }
    if (!whitelistedEdges.has(edge.tag)) {
      throw new Error(
        `Edge ${edge.tag} from ${edge.source.id} to ${edge.target.id} is not a containment association`,
      )
    }
  })
}

function validateRelationshipTransformation(
  model: GraphModel,
  { relationshipsAsEdges }: UmlHandlerParameters,
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

function allAttributesAreKnown(model: GraphModel) {
  model.nodes.forEach((node) => {
    node.attributes.forEach(({ name }) => {
      if (!(name in Uml.Attributes)) {
        throw new Error(
          `Attribute ${name} of node ${formatElement(node)} is unknown`,
        )
      }
    })
  })
  model.edges.forEach((edge) => {
    edge.attributes.forEach(({ name }) => {
      if (!(name in Uml.Attributes)) {
        throw new Error(
          `Attribute ${name} of edge ${edge.tag} from ${
            formatElement(edge.source)
          } to ${formatElement(edge.target)} is unknown`,
        )
      }
    })
  })
}

function formatElement(element: GraphNode) {
  return element.model.settings.debug ? element.show() : element.id
}
