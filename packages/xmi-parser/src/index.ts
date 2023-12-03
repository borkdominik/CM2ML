import type { Attribute, Value } from '@cm2ml/ir'
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
  const root = mapDocument(document)
  const model = new GraphModel(root, idAttribute)
  collectAllElements(root).forEach((node) => model.addNode(node))
  return model
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
  const xmiElement = new GraphNode(element.tagName)
  Stream.fromObject(element.attribs)
    .map(mapAttribute)
    .forEach((attribute) => xmiElement.addAttribute(attribute, true))
  Stream.from(element.childNodes)
    .map((child) => (isElement(child) ? mapElement(child) : null))
    .filterNonNull()
    .forEach((child) => xmiElement.addChild(child))
  return xmiElement
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
