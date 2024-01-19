import type { GraphNode } from '@cm2ml/ir'

import { Vertex } from '../uml-metamodel'

export const VertexHandler = Vertex.createHandler(
  (vertex, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_container(vertex)
    addEdge_incoming(vertex)
    addEdge_outgoing(vertex)
    addEdge_redefinedVertex(vertex)
    addEdge_redefinitionContext(vertex)
  },
)

function addEdge_container(_vertex: GraphNode) {
  // TODO/Association
  // container : Region [0..1]{subsets NamedElement::namespace} (opposite Region::subvertex)
  // The Region that contains this Vertex.
}

function addEdge_incoming(_vertex: GraphNode) {
  // TODO/Association
  // /incoming : Transition [0..*]{} (opposite Transition::target)
  // Specifies the Transitions entering this Vertex.
}

function addEdge_outgoing(_vertex: GraphNode) {
  // TODO/Association
  // /outgoing : Transition [0..*]{} (opposite Transition::source)
  // Specifies the Transitions departing from this Vertex.
}

function addEdge_redefinedVertex(_vertex: GraphNode) {
  // TODO/Association
  // redefinedVertex : Vertex [0..1]{subsets RedefinableElement::redefinedElement} (opposite A_redefinedVertex_vertex::vertex)
  // The Vertex of which this Vertex is a redefinition.
}

function addEdge_redefinitionContext(_vertex: GraphNode) {
  // TODO/Association
  // /redefinitionContext : Classifier [1..1]{redefines RedefinableElement::redefinitionContext} (opposite A_redefinitionContext_vertex::vertex)
  // References the Classifier in which context this element may be redefined.
}
