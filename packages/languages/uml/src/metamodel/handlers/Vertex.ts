import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Region, Transition, Vertex } from '../uml-metamodel'

export const VertexHandler = Vertex.createHandler(
  (vertex, { onlyContainmentAssociations }) => {
    const container = resolve(vertex, 'container', { type: Region })
    const incoming = resolve(vertex, 'incoming', { many: true, type: Transition })
    const outgoing = resolve(vertex, 'outgoing', { many: true, type: Transition })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_container(vertex, container)
    addEdge_incoming(vertex, incoming)
    addEdge_outgoing(vertex, outgoing)
    addEdge_redefinedVertex(vertex)
    addEdge_redefinitionContext(vertex)
  },
)

function addEdge_container(vertex: GraphNode, container: GraphNode | undefined) {
  // container : Region [0..1]{subsets NamedElement::namespace} (opposite Region::subvertex)
  // The Region that contains this Vertex.
  if (!container) {
    return
  }
  vertex.model.addEdge('container', vertex, container)
}

function addEdge_incoming(vertex: GraphNode, incoming: GraphNode[]) {
  // /incoming : Transition [0..*]{} (opposite Transition::target)
  // Specifies the Transitions entering this Vertex.
  incoming.forEach((incoming) => {
    vertex.model.addEdge('incoming', vertex, incoming)
  })
}

function addEdge_outgoing(vertex: GraphNode, outgoing: GraphNode[]) {
  // /outgoing : Transition [0..*]{} (opposite Transition::source)
  // Specifies the Transitions departing from this Vertex.
  outgoing.forEach((outgoing) => {
    vertex.model.addEdge('outgoing', vertex, outgoing)
  })
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
