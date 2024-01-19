import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { Uml } from '../uml'
import {
  Association,
  Class,
  DataType,
  Interface,
  Property,
} from '../uml-metamodel'

export const PropertyHandler = Property.createHandler(
  (property, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_association(property)
    addEdge_associationEnd(property)
    addEdge_class(property)
    addEdge_datatype(property)
    addEdge_defaultValue(property)
    addEdge_interface(property)
    addEdge_opposite(property)
    addEdge_qualifier(property)
    addEdge_redefinedProperty(property)
    addEdge_subsettedProperty(property)
  },
  {
    [Uml.Attributes.aggregation]: 'none',
    [Uml.Attributes.isComposite]: 'false',
    [Uml.Attributes.isDerived]: 'false',
    [Uml.Attributes.isDerivedUnion]: 'false',
    [Uml.Attributes.isID]: 'false',
  },
)

function addEdge_association(property: GraphNode) {
  // association : Association [0..1]{subsets A_member_memberNamespace::memberNamespace} (opposite Association::memberEnd)
  // The Association of which this Property is a member, if any.
  const association = property.getAttribute('association')
  if (!association) {
    return
  }
  const associationNode = property.model.getNodeById(association.value.literal)
  if (!associationNode) {
    throw new Error(`Association ${association.value.literal} not found`)
  }
  if (!Association.isAssignable(associationNode)) {
    throw new Error(`Node ${associationNode.show()} is not an association`)
  }
  property.model.addEdge('association', property, associationNode)
  property.removeAttribute('association')
  addEdge_owningAssociation(property, associationNode)
}

function addEdge_associationEnd(_property: GraphNode) {
  // TODO/Association
  // associationEnd : Property [0..1]{subsets Element::owner} (opposite Property::qualifier)
  // Designates the optional association end that owns a qualifier attribute.
}

function addEdge_class(property: GraphNode) {
  const parent = property.parent
  if (parent && Class.isAssignable(parent)) {
    property.model.addEdge('class', property, parent)
  }
}

function addEdge_datatype(property: GraphNode) {
  const parent = property.parent
  if (parent && DataType.isAssignable(parent)) {
    property.model.addEdge('datatype', property, parent)
  }
}

function addEdge_defaultValue(_property: GraphNode) {
  // TODO/Association
  // ♦ defaultValue : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_defaultValue_owningProperty::owningProperty)
  // A ValueSpecification that is evaluated to give a default value for the Property when an instance of the owning Classifier is instantiated.
}

function addEdge_interface(property: GraphNode) {
  const parent = property.parent
  if (parent && Interface.isAssignable(parent)) {
    property.model.addEdge('interface', property, parent)
  }
}

function addEdge_opposite(_property: GraphNode) {
  // TODO/Association
  // /opposite : Property [0..1] (opposite A_opposite_property::property)
  // In the case where the Property is one end of a binary association this gives the other end.
}

function addEdge_owningAssociation(
  property: GraphNode,
  association: GraphNode,
) {
  // TODO
  // owningAssociation : Association [0..1]{subsets Feature::featuringClassifier, subsets NamedElement::namespace, subsets Property::association, subsets RedefinableElement::redefinitionContext} (opposite Association::ownedEnd)
  // The owning association of this property, if any.
  const parentAssociation = getParentOfType(property, Association)
  if (parentAssociation !== association) {
    return
  }
  property.model.addEdge('owningAssociation', property, association)
}

function addEdge_qualifier(_property: GraphNode) {
  // TODO/Association
  // ♦ qualifier : Property [0..*]{ordered, subsets Element::ownedElement} (opposite Property::associationEnd)
  // An optional list of ordered qualifier attributes for the end.
}

function addEdge_redefinedProperty(_property: GraphNode) {
  // TODO/Association
  // redefinedProperty : Property [0..*]{subsets RedefinableElement::redefinedElement} (opposite A_redefinedProperty_property::property)
  // The properties that are redefined by this property, if any.
}

function addEdge_subsettedProperty(_property: GraphNode) {
  // TODO/Association
  // subsettedProperty : Property [0..*] (opposite A_subsettedProperty_property::property)
  // The properties of which this Property is constrained to be a subset, if any.
}
