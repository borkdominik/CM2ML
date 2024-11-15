import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Class, Classifier, Operation, Property, Reception } from '../uml-metamodel'

export const ClassHandler = Class.createHandler(
  (class_, { onlyContainmentAssociations }) => {
    const nestedClassifiers = resolve(class_, 'nestedClassifier', { many: true, type: Classifier })
    const ownedAttributes = resolve(class_, 'ownedAttribute', { many: true, type: Property })
    const ownedOperations = resolve(class_, 'ownedOperation', { many: true, type: Operation })
    const ownedReceptions = resolve(class_, 'ownedReception', { many: true, type: Reception })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_extension(class_)
    addEdge_superClass(class_)
    addEdge_nestedClassifier(class_, nestedClassifiers)
    addEdge_ownedAttribute(class_, ownedAttributes)
    addEdge_ownedOperations(class_, ownedOperations)
    addEdge_ownedReception(class_, ownedReceptions)
  },
  {
    [Uml.Attributes.isAbstract]: { type: 'boolean', defaultValue: 'false' },
    [Uml.Attributes.isActive]: { type: 'boolean', defaultValue: 'false' },
  },
)

function addEdge_extension(_class_: GraphNode) {
  // /extension : Extension [0..*]{} (opposite Extension::metaclass)
  // This property is used when the Class is acting as a metaclass. It references the Extensions that specify additional properties of the metaclass. The property is derived from the Extensions whose memberEnds are typed by the Class.

  // Added by ExtensionHandler::addEdge_metaclass
}

function addEdge_nestedClassifier(class_: GraphNode, nestedClassifiers: GraphNode[]) {
  // ♦ nestedClassifier : Classifier [0..*]{ordered, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Namespace::ownedMember} (opposite A_nestedClassifier_nestingClass::nestingClass)
  // The Classifiers owned by the Class that are not ownedBehaviors.
  nestedClassifiers.forEach((nestedClassifier) => {
    class_.model.addEdge('nestedClassifier', class_, nestedClassifier)
  })
}

function addEdge_ownedAttribute(class_: GraphNode, ownedAttributes: GraphNode[]) {
  // ♦ ownedAttribute : Property [0..*]{ordered, subsets Classifier::attribute, subsets Namespace::ownedMember, redefines StructuredClassifier::ownedAttribute} (opposite Property::class)
  // The attributes (i.e., the Properties) owned by the Class
  ownedAttributes.forEach((ownedAttribute) => {
    class_.model.addEdge('ownedAttribute', class_, ownedAttribute)
    class_.model.addEdge('attribute', class_, ownedAttribute)
    ownedAttribute.model.addEdge('class', ownedAttribute, class_)
  })
}

function addEdge_ownedOperations(class_: GraphNode, ownedOperations: GraphNode[]) {
  // Note: This association is not listed explicitly in the UML spec, but included in a number of places (e.g., diagrams) in the spec
  ownedOperations.forEach((ownedOperation) => {
    class_.model.addEdge('ownedOperation', class_, ownedOperation)
    ownedOperation.model.addEdge('class', ownedOperation, class_)
  })
}

function addEdge_ownedReception(class_: GraphNode, ownedReceptions: GraphNode[]) {
  // ♦ ownedReception : Reception [0..*]{subsets Classifier::feature, subsets Namespace::ownedMember} (opposite A_ownedReception_class::class)
  // The Receptions owned by the Class.
  ownedReceptions.forEach((ownedReception) => {
    class_.model.addEdge('ownedReception', class_, ownedReception)
  })
}

function addEdge_superClass(_class_: GraphNode) {
  // /superClass : Class [0..*]{redefines Classifier::general} (opposite A_superClass_class::class)
  // The superclasses of a Class, derived from its Generalizations.

  // Added by Generalization::addEdge_specific
}
