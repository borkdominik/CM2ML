import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { Component, PackageableElement } from '../uml-metamodel'

export const ComponentHandler = Component.createHandler(
  (component, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    component.children.forEach((child) => {
      addEdge_packagedElement(component, child)
    })
    addEdge_provided(component)
    addEdge_realization(component)
    addEdge_required(component)
  },
  {
    [Uml.Attributes.isIndirectlyInstantiated]: 'true',
  },
)

function addEdge_packagedElement(component: GraphNode, child: GraphNode) {
  if (PackageableElement.isAssignable(child)) {
    component.model.addEdge('packagedElement', component, child)
  }
}

function addEdge_provided(_component: GraphNode) {
  // TODO
  // /provided : Interface [0..*]{} (opposite A_provided_component::component)
  // The Interfaces that the Component exposes to its environment.These Interfaces may be Realized by the Component or any of its realizingClassifiers, or they may be the Interfaces that are provided by its public Ports.
}

function addEdge_realization(_component: GraphNode) {
  // TODO
  // ♦ realization: ComponentRealization[0..*]{subsets Element:: ownedElement, subsets A_supplier_supplierDependency:: supplierDependency } (opposite ComponentRealization::abstraction)
  // The set of Realizations owned by the Component.Realizations reference the Classifiers of which the Component is an abstraction; i.e., that realize its behavior.
}

function addEdge_required(_component: GraphNode) {
  // TODO
  // /required : Interface [0..*]{} (opposite A_required_component::component)
  // The Interfaces that the Component requires from other Components in its environment in order to be able to offer its full set of provided functionality. These Interfaces may be used by the Component or any of its realizingClassifiers, or they may be the Interfaces that are required by its public Ports.
}
