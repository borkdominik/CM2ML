import type { GraphModel } from '@cm2ml/ir'

import { Uml } from './uml'
import type { UmlHandlerParameters } from './uml-metamodel'
import { Relationship } from './uml-metamodel'

export function validateUmlModel(
  model: GraphModel,
  handlerParameters: UmlHandlerParameters,
) {
  if (!model.settings.strict) {
    return
  }
  model.debug('Validating UML model')
  validateOnlyContainmentAssociations(model, handlerParameters)
  validateRelationshipTransformation(model, handlerParameters)
  allAttributesAreKnown(model)
  model.debug('All UML validations passed')
}

function validateOnlyContainmentAssociations(
  model: GraphModel,
  { onlyContainmentAssociations, relationshipsAsEdges }: UmlHandlerParameters,
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
          `Attribute ${name} of node ${node.id ?? node.show()} is unknown`,
        )
      }
    })
  })
  model.edges.forEach((edge) => {
    edge.attributes.forEach(({ name }) => {
      if (!(name in Uml.Attributes)) {
        throw new Error(
          `Attribute ${name} of edge ${edge.tag} from ${
            edge.source.id ?? edge.source.show()
          } to ${edge.target.id ?? edge.target.show()} is unknown`,
        )
      }
    })
  })
}