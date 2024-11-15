import type { GraphNode } from '@cm2ml/ir'

import { isCompositeProperty } from '../resolvers/isComposite'
import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import {
  Association,
  DataType,
  Interface,
  Property,
  ValueSpecification,
} from '../uml-metamodel'

export const PropertyHandler = Property.createHandler(
  (property, { onlyContainmentAssociations }) => {
    removeInvalidIsNavigableAttribute(property)
    setAttribute_isComposite(property)
    const association = resolve(property, 'association', { type: Association })
    const datatype = resolve(property, 'datatype', { type: DataType })
    const defaultValue = resolve(property, 'defaultValue', { type: ValueSpecification })
    const interface_ = resolve(property, 'interface', { type: Interface })
    const owningAssociations = resolve(property, 'owningAssociation', { many: true, type: Association })
    const qualifiers = resolve(property, 'qualifier', { many: true, type: Property })
    const redefinedProperties = resolve(property, 'redefinedProperty', { many: true, type: Property })
    const subsettedProperties = resolve(property, 'subsettedProperty', { many: true, type: Property })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_association(property, association)
    addEdge_associationEnd(property)
    addEdge_class(property)
    addEdge_datatype(property, datatype)
    addEdge_defaultValue(property, defaultValue)
    addEdge_interface(property, interface_)
    addEdge_opposite(property)
    addEdge_owningAssociation(property, owningAssociations)
    addEdge_qualifier(property, qualifiers)
    addEdge_redefinedProperty(property, redefinedProperties)
    addEdge_subsettedProperty(property, subsettedProperties)
  },
  {
    [Uml.Attributes.aggregation]: { type: 'category', defaultValue: 'none' },
    [Uml.Attributes.isComposite]: { type: 'boolean', defaultValue: 'false' },
    [Uml.Attributes.isDerived]: { type: 'boolean', defaultValue: 'false' },
    [Uml.Attributes.isDerivedUnion]: { type: 'boolean', defaultValue: 'false' },
    [Uml.Attributes.isID]: { type: 'boolean', defaultValue: 'false' },
  },
)

/**
 * Note: A large number of UML models from the TDD dataset contain unspecified "isNavigable" attributes.
 */
function removeInvalidIsNavigableAttribute(property: GraphNode) {
  property.removeAttribute('isNavigable')
}

function setAttribute_isComposite(property: GraphNode) {
  if (!isCompositeProperty(property)) {
    return
  }
  property.addAttribute({ name: Uml.Attributes.isComposite, type: 'boolean', value: { literal: 'true' } }, false)
}

function addEdge_association(
  property: GraphNode,
  association: GraphNode | undefined,
) {
  // association : Association [0..1]{subsets A_member_memberNamespace::memberNamespace} (opposite Association::memberEnd)
  // The Association of which this Property is a member, if any.
  if (!association) {
    return
  }
  property.model.addEdge('association', property, association)
}

function addEdge_associationEnd(_property: GraphNode) {
  // associationEnd : Property [0..1]{subsets Element::owner} (opposite Property::qualifier)
  // Designates the optional association end that owns a qualifier attribute.

  // Added by addEdge_qualifier
}

function addEdge_class(_property: GraphNode) {
  // lass : Class [0..1]{subsets NamedElement::namespace, subsets A_ownedAttribute_structuredClassifier::structuredClassifier, subsets A_attribute_classifier::classifier} (opposite Class::ownedAttribute)
  // The Class that owns this Property, if any.

  // Added by Class::addEdge_ownedAttribute
}

function addEdge_datatype(property: GraphNode, datatype: GraphNode | undefined) {
  // datatype : DataType [0..1]{subsets NamedElement::namespace, subsets A_attribute_classifier::classifier} (opposite DataType::ownedAttribute)
  // The DataType that owns this Property, if any.

  // Added by DataType::addEdge_ownedAttribute
  if (!datatype) {
    return
  }
  property.model.addEdge('datatype', property, datatype)
}

function addEdge_defaultValue(property: GraphNode, defaultValue: GraphNode | undefined) {
  // ♦ defaultValue : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_defaultValue_owningProperty::owningProperty)
  // A ValueSpecification that is evaluated to give a default value for the Property when an instance of the owning Classifier is instantiated.
  if (!defaultValue) {
    return
  }
  property.model.addEdge('defaultValue', property, defaultValue)
}

function addEdge_interface(_property: GraphNode, _interface_: GraphNode | undefined) {
  // interface : Interface [0..1]{subsets NamedElement::namespace, subsets A_attribute_classifier::classifier} (opposite Interface::ownedAttribute)
  // The Interface that owns this Property, if any.

  // Added by Interface::addEdge_ownedAttribute
}

function addEdge_opposite(_property: GraphNode) {
  // /opposite : Property [0..1] (opposite A_opposite_property::property)
  // In the case where the Property is one end of a binary association this gives the other end.

  // Added by Association::addEdge_opposite
}

function addEdge_owningAssociation(
  property: GraphNode,
  owningAssociations: GraphNode[],
) {
  // owningAssociation : Association [0..1]{subsets Feature::featuringClassifier, subsets NamedElement::namespace, subsets Property::association, subsets RedefinableElement::redefinitionContext} (opposite Association::ownedEnd)
  // The owning association of this property, if any.
  owningAssociations.forEach((owningAssociation) => {
    property.model.addEdge('owningAssociation', property, owningAssociation)
  })
}

function addEdge_qualifier(property: GraphNode, qualifiers: GraphNode[]) {
  // ♦ qualifier : Property [0..*]{ordered, subsets Element::ownedElement} (opposite Property::associationEnd)
  // An optional list of ordered qualifier attributes for the end.
  qualifiers.forEach((qualifier) => {
    property.model.addEdge('qualifier', property, qualifier)
    qualifier.model.addEdge('associationEnd', qualifier, property)
  })
}

function addEdge_redefinedProperty(property: GraphNode, redefinedProperties: GraphNode[]) {
  // redefinedProperty : Property [0..*]{subsets RedefinableElement::redefinedElement} (opposite A_redefinedProperty_property::property)
  // The properties that are redefined by this property, if any.
  redefinedProperties.forEach((redefinedProperty) => {
    property.model.addEdge('redefinedProperty', property, redefinedProperty)
  })
}

function addEdge_subsettedProperty(property: GraphNode, subsettedProperties: GraphNode[]) {
  // subsettedProperty : Property [0..*] (opposite A_subsettedProperty_property::property)
  // The properties of which this Property is constrained to be a subset, if any.
  subsettedProperties.forEach((subsettedProperty) => {
    property.model.addEdge('subsettedProperty', property, subsettedProperty)
  })
}
