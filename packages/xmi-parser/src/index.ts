import type { Attribute, GraphNode, Settings, Value } from '@cm2ml/ir'
import { GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'
import { parseNamespace } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'
import { Element, Text } from 'domhandler'
import type { Document, Node } from 'domhandler'
import { parseDocument } from 'htmlparser2'

export const XmiParser = definePlugin({
  name: 'xmi',
  parameters: {
    idAttribute: {
      type: 'string',
      defaultValue: 'xmi:id',
      description:
        'The name of the attribute that is used to identify elements.',
    },
    debug: {
      type: 'boolean',
      defaultValue: false,
      description: 'Whether to log debug information.',
    },
    strict: {
      type: 'boolean',
      defaultValue: false,
      description: 'Whether to fail when encountering unknown information.',
    },
  },
  invoke: (input: string, settings) => parse(input, settings),
})

function parse(xmi: string, settings: Settings): GraphModel {
  const document = parseDocument(xmi, {
    xmlMode: true,
  })
  return mapDocument(document, settings)
}

function mapDocument(document: Document, settings: Settings) {
  const elementChildren = Stream.from(document.childNodes)
    .map((node) => (isElement(node) ? node : null))
    .filterNonNull()
    .toArray()
  const root = elementChildren[0]
  if (elementChildren.length !== 1 || !root) {
    throw new Error('Expected exactly one root element')
  }
  const model = new GraphModel(settings, root.tagName)
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
  Stream.from(element.childNodes).forEach((child) => {
    if (isElement(child)) {
      const childNode = createNodeFromElement(node.model, child)
      node.addChild(childNode)
      return
    }
    if (isText(child)) {
      const data = child.data.trim()
      if (
        child.data === '' ||
        node.tag !== 'body' ||
        node.getAttribute('body') !== undefined
      ) {
        return
      }
      node.addAttribute({ name: 'body', value: { literal: data } })
    }
  })
}

function mapAttribute([name, value]: [string, string]): Attribute {
  const xmiValue = mapValue(value)
  const parsedName = parseNamespace(name)
  if (typeof parsedName === 'object') {
    return {
      name,
      simpleName: parsedName.name,
      namespace: parsedName.namespace,
      value: xmiValue,
    }
  }
  return { name, value: xmiValue }
}

function mapValue(value: string): Value {
  if (!value.includes(':') || value.startsWith('http')) {
    return { literal: value }
  }
  const [namespace, ...rest] = value.split(':')
  return { literal: rest.join(':'), namespace }
}

function isElement(node: Node): node is Element {
  return node.type === 'tag' || node instanceof Element
}

function isText(node: Node): node is Text {
  return node.type === 'text' || node instanceof Text
}
