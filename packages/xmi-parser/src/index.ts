import type { Attribute, GraphNode, Value } from '@cm2ml/ir'
import { GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'
import { parseNamespace } from '@cm2ml/utils'
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
  return mapDocument(document, idAttribute)
}

function mapDocument(document: Document, idAttribute: string) {
  const elementChildren = Stream.from(document.childNodes)
    .map((node) => (isElement(node) ? node : null))
    .filterNonNull()
    .toArray()
  const root = elementChildren[0]
  if (elementChildren.length !== 1 || !root) {
    throw new Error('Expected exactly one root element')
  }
  const model = new GraphModel(idAttribute, root.tagName)
  initNodeFromElement(model.root, root)
  return model
}

function createNodeFromElement(model: GraphModel, element: Element): GraphNode {
  const node = model.addNode(element.tagName)
  initNodeFromElement(node, element)
  return node
}

function initNodeFromElement(node: GraphNode, element: Element) {
  Stream.fromObject(element.attribs)
    .map(mapAttribute)
    .forEach((attribute) => node.addAttribute(attribute, true))
  Stream.from(element.childNodes)
    .map((child) =>
      isElement(child) ? createNodeFromElement(node.model, child) : null,
    )
    .filterNonNull()
    .forEach((child) => node.addChild(child))
}

function mapAttribute([name, value]: [string, string]): Attribute {
  const xmiValue = mapValue(value)
  const parsedName = parseNamespace(name)
  if (parsedName.namespace) {
    return {
      fullName: name,
      name: parsedName.name,
      namespace: parsedName.namespace,
      value: xmiValue,
    }
  }
  return { name, value: xmiValue }
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
