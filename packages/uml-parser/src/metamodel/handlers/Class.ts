import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import { Class, Property } from '../metamodel'

export const ClassHandler = Class.createHandler((clazz) => {
  addEdge_extension(clazz)
  addEdge_superClass(clazz)
  clazz.children.forEach((child) => {
    addEdge_nestedClassifier(clazz, child)
    addEdge_ownedAttribute(clazz, child)
    addEdge_ownedReception(clazz, child)
  })
})

function addEdge_extension(_clazz: GraphNode) {
  // TODO
  // /extension : Extension [0..*]{} (opposite Extension::metaclass)
  // This property is used when the Class is acting as a metaclass. It references the Extensions that specify additional properties of the metaclass. The property is derived from the Extensions whose memberEnds are typed by the Class.
}

function addEdge_nestedClassifier(clazz: GraphNode, child: GraphNode) {
  if (Class.isAssignable(child)) {
    clazz.model.addEdge('nestedClassifier', clazz, child)
  }
}

function addEdge_ownedAttribute(clazz: GraphNode, child: GraphNode) {
  if (Property.isAssignable(child)) {
    clazz.model.addEdge(Uml.Tags.ownedAttribute, clazz, child)
  }
}

function addEdge_ownedReception(_clazz: GraphNode, _child: GraphNode) {
  // TODO
  // ♦ ownedReception : Reception [0..*]{subsets Classifier::feature, subsets Namespace::ownedMember} (opposite A_ownedReception_class::class)
  // The Receptions owned by the Class.
}

function addEdge_superClass(_clazz: GraphNode) {
  // TODO
  // /superClass : Class [0..*]{redefines Classifier::general} (opposite A_superClass_class::class)
  // The superclasses of a Class, derived from its Generalizations.
}
