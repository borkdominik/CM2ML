import type { GraphModel, GraphNode } from '@cm2ml/ir'

import { resolve } from './resolvers/resolve'
import type { UmlType } from './uml'
import { Uml } from './uml'
import type { UmlHandlerParameters } from './uml-metamodel'
import { Element, Relationship } from './uml-metamodel'

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
  validateAttributes(model)
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

function validateAttributes(model: GraphModel) {
  const alwaysResolvableAttributes = new Set<string>([Uml.Attributes.name, Uml.Attributes['xmi:type'], Uml.Attributes['xsi:type']])
  const typesWithBodyAttribute = new Set<UmlType>([Uml.Types.Comment, Uml.Types.OpaqueAction, Uml.Types.OpaqueBehavior, Uml.Types.OpaqueExpression])
  model.nodes.forEach((node) => {
    const nodeType = Uml.getType(node)
    node.attributes.forEach(({ name, type }) => {
      if (type === 'unknown') {
        throw new Error(`Attribute ${name} of node ${formatElement(node)} is of unknown type`)
      }
      if (name === model.settings.idAttribute) {
        return
      }
      if (!(name in Uml.Attributes)) {
        throw new Error(
          `Attribute ${name} of node ${formatElement(node)} is unknown`,
        )
      }
      if (alwaysResolvableAttributes.has(name) || (name === Uml.Attributes.body && nodeType !== undefined && typesWithBodyAttribute.has(nodeType))) {
        return
      }
      const resolvedNodes = resolve(node, name, { removeAttribute: false, many: true, type: Element })
      if (resolvedNodes.length > 0) {
        throw new Error(`Attribute ${name} of node ${formatElement(node)} is not resolved`)
      }
    })
  })
  model.edges.forEach((edge) => {
    edge.attributes.forEach(({ name, type }) => {
      if (type === 'unknown') {
        throw new Error(
          `Attribute ${name} of edge ${edge.tag} from ${
            formatElement(edge.source)
          } to ${formatElement(edge.target)} is of unknown type`,
        )
      }
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
