import type { GraphNode } from '@cm2ml/ir'

import { Class, Property } from '../uml-metamodel'

export const ClassHandler = Class.createHandler(
  (class_, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_extension(class_)
    addEdge_superClass(class_)
    class_.children.forEach((child) => {
      addEdge_nestedClassifier(class_, child)
      addEdge_ownedAttribute(class_, child)
      addEdge_ownedReception(class_, child)
    })
  },
)

function addEdge_extension(_class_: GraphNode) {
  // TODO
  // /extension : Extension [0..*]{} (opposite Extension::metaclass)
  // This property is used when the Class is acting as a metaclass. It references the Extensions that specify additional properties of the metaclass. The property is derived from the Extensions whose memberEnds are typed by the Class.
}

function addEdge_nestedClassifier(class_: GraphNode, child: GraphNode) {
  if (Class.isAssignable(child)) {
    class_.model.addEdge('nestedClassifier', class_, child)
  }
}

function addEdge_ownedAttribute(class_: GraphNode, child: GraphNode) {
  if (Property.isAssignable(child)) {
    class_.model.addEdge('ownedAttribute', class_, child)
  }
}

function addEdge_ownedReception(_class_: GraphNode, _child: GraphNode) {
  // TODO
  // ♦ ownedReception : Reception [0..*]{subsets Classifier::feature, subsets Namespace::ownedMember} (opposite A_ownedReception_class::class)
  // The Receptions owned by the Class.
}

function addEdge_superClass(_class_: GraphNode) {
  // TODO
  // /superClass : Class [0..*]{redefines Classifier::general} (opposite A_superClass_class::class)
  // The superclasses of a Class, derived from its Generalizations.
}
