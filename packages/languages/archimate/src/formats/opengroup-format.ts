// Open Group Model Exchange Format (typically ending in *.xml)

import type { GraphModel, GraphNode } from '@cm2ml/ir'

import { Archimate } from '../metamodel/archimate'

// https://www.opengroup.org/xsd/archimate/
export function isOpenGroupFormat(input: GraphModel) {
  return (
    input.root.tag === 'model' &&
    input.root.getAttribute('xmlns')?.value.literal.startsWith('http://www.opengroup.org/xsd/archimate')
  )
}

export function restructureOpenGroupXml(input: GraphModel) {
  // TODO: persist metadata
  renameIdAttributes(input, 'identifier')
  input.nodes.forEach((node) => {
    switch (node.tag) {
      case 'metadata':
        input.removeNode(node)
        break
      case 'name':
        handleName(node, input)
        break
      case 'documentation':
        handleDocumentation(node, input)
        break
      case 'elements':
        handleElements(node, input)
        break
      case 'relationships':
        handleRelationships(node, input)
        break
      case 'views':
        handleViews(node, input)
        break
    }
  })
}

function renameIdAttributes(input: GraphModel, idAttribute: string) {
  input.nodes.forEach((node) => {
    const id = node.getAttribute(idAttribute)?.value.literal
    if (id) {
      node.removeAttribute(idAttribute)
      node.addAttribute({ name: Archimate.Attributes.id, type: 'string', value: { literal: id } }, true)
    }
  })
}

function handleName(node: GraphNode, input: GraphModel) {
  const text = node.getAttribute('text')?.value.literal
  if (text) {
    node.parent?.addAttribute({ name: Archimate.Attributes.name, type: 'string', value: { literal: text } })
  }
  input.removeNode(node)
}

function handleDocumentation(node: GraphNode, input: GraphModel) {
  const text = node.getAttribute('text')?.value.literal
  if (text) {
    node.parent?.addAttribute({ name: Archimate.Attributes.documentation, type: 'string', value: { literal: text } })
  }
  input.removeNode(node)
}

function handleElements(node: GraphNode, input: GraphModel) {
  node.children.forEach((element) => {
    if (element.tag === 'element') {
      node.removeChild(element)
      input.root.addChild(element)
    }
  })
  input.removeNode(node)
}

function handleRelationships(node: GraphNode, input: GraphModel) {
  node.children.forEach((relationship) => {
    if (relationship.tag === 'relationship') {
      node.removeChild(relationship)
      relationship.tag = 'element'
      updateRelationshipType(relationship)
      input.root.addChild(relationship)
    }
  })
  input.removeNode(node)
}

function handleViews(viewsElement: GraphNode, input: GraphModel) {
  const diagrams = viewsElement.children.values().next().value as GraphNode
  if (diagrams.tag !== 'diagrams' || viewsElement.children.size !== 1) {
    throw new Error('Should contain exactly one <diagrams> element')
  }
  diagrams.children.forEach((view) => {
    if (view.getAttribute('xsi:type')?.value.literal !== 'Diagram') {
      return
    }
    view.removeAttribute('xsi:type')
    view.addAttribute({ name: 'xsi:type', type: 'string', value: { literal: Archimate.Types.ArchimateDiagramModel } })
    view.children.forEach((node) => {
      if (node.tag === 'node') {
        node.tag = 'element'
        node.removeAttribute('xsi:type')
        node.addAttribute({ name: 'xsi:type', type: 'string', value: { literal: Archimate.Types.DiagramObject } })
        const elementRef = node.getAttribute('elementRef')?.value.literal
        if (elementRef) {
          node.removeAttribute('elementRef')
          node.addAttribute({ name: 'archimateElement', type: 'string', value: { literal: elementRef } })
        }
      }
    })
    diagrams.removeChild(view)
    input.root.addChild(view)
  })
  input.removeNode(viewsElement)
}

function updateRelationshipType(node: GraphNode) {
  const type = node.getAttribute(Archimate.Attributes['xsi:type'])?.value.literal
  if (type) {
    node.removeAttribute(Archimate.Attributes['xsi:type'])
    node.addAttribute({ name: Archimate.Attributes['xsi:type'], type: 'string', value: { literal: `${type}Relationship` } })
  }
}
