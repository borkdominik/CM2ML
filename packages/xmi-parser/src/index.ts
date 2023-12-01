import type { Attribute, AttributeName, Value } from '@cm2ml/ir'
import { GraphModel, GraphNode } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { Element } from 'domhandler'
import type { Document, Node } from 'domhandler'
import { parseDocument } from 'htmlparser2'

export const XmiParser = definePlugin({
  name: 'xmi',
  parameters: {
    idAttribute: {
      type: 'string',
      defaultValue: 'id',
      description:
        'The name of the attribute that is used to identify elements.',
    },
  },
  invoke: (input: string, { idAttribute }) => parse(input, idAttribute),
})

function parse(xmi: string, idAttribute: string): GraphModel {
  const document = parseDocument(xmi, {
    xmlMode: true,
  })
  return getGraphModel(document, idAttribute)
}

function getGraphModel(document: Document, idAttribute: string): GraphModel {
  const nodeMap = new Map<string, GraphNode>()

  function registerElement(element: GraphNode) {
    const id = element.getAttribute('id')?.value.literal
    if (id === undefined) {
      return
    }
    if (nodeMap.has(id)) {
      throw new Error(`Duplicate element with id ${id}`)
    }
    nodeMap.set(id, element)
  }

  const root = mapDocument(document)
  const nodes = collectAllElements(root).forEach(registerElement).toArray()

  return new GraphModel(root, nodes, [], idAttribute, nodeMap)
}

function mapDocument(document: Document) {
  const elementChildren = Stream.from(document.childNodes)
    .map((node) => (isElement(node) ? node : null))
    .filterNonNull()
    .toArray()
  const root = elementChildren[0]
  if (elementChildren.length !== 1 || !root) {
    throw new Error('Expected exactly one root element')
  }
  return mapElement(root)
}

function mapElement(element: Element): GraphNode {
  const attributes = mapAttributes(element.attribs)
  const children = Stream.from(element.childNodes)
    .map((child) => (isElement(child) ? mapElement(child) : null))
    .filterNonNull()
    .toArray()
  const xmiElement = new GraphNode(element.tagName, attributes, children)
  children.forEach((child) => (child.parent = xmiElement))
  return xmiElement
}

function mapAttributes(
  attributes: Record<string, string>
): Record<AttributeName, Attribute> {
  return Stream.fromObject(attributes)
    .map(mapAttribute)
    .toRecord(
      ({ name }) => name,
      (attribute) => attribute
    )
}

function mapAttribute([name, value]: [string, string]): Attribute {
  const xmiValue = mapValue(value)
  if (!name.includes(':')) {
    return { name, value: xmiValue }
  }
  const [namespace, ...rest] = name.split(':')
  return { fullName: name, name: rest.join(':'), value: xmiValue, namespace }
}

function mapValue(value: string): Value {
  if (!value.includes(':')) {
    return { literal: value }
  }
  const [namespace, ...rest] = value.split(':')
  return { literal: rest.join(':'), namespace }
}

function isElement(node: Node): node is Element {
  return node.type === 'tag' || node instanceof Element
}

function collectAllElements(element: GraphNode): Stream<GraphNode> {
  return Stream.from(element.children)
    .flatMap(collectAllElements)
    .append(element)
}
