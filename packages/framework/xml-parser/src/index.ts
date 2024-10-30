import type { Attribute, GraphNode, Metamodel, Settings, Value } from '@cm2ml/ir'
import { GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'
import { parseNamespace } from '@cm2ml/utils'
import { Stream } from '@yeger/streams'
import { Element, Text } from 'domhandler'
import type { Document, Node } from 'domhandler'
import { parseDocument } from 'htmlparser2'

export type TextNodeHandler = (node: GraphNode, text: string) => void

export function createXMLParser(
  metamodel: Metamodel<string, string, string>,
  textNodeHandler: TextNodeHandler,
) {
  return definePlugin({
    name: 'xml',
    parameters: {
      debug: {
        type: 'boolean',
        defaultValue: false,
        description: 'Log debug information and validate results if strict is also enabled.',
      },
      strict: {
        type: 'boolean',
        defaultValue: false,
        description: 'Fail when encountering unknown or invalid input.',
      },
    },
    invoke: (input: string, settings) =>
      parse(input, metamodel, settings, textNodeHandler),
  })
}

function parse(
  xml: string,
  metamodel: Metamodel<string, string, string>,
  settings: Settings,
  textNodeHandler: TextNodeHandler,
): GraphModel {
  const document = parseDocument(xml, {
    xmlMode: true,
  })
  return mapDocument(document, metamodel, settings, textNodeHandler)
}

function mapDocument(
  document: Document,
  metamodel: Metamodel<string, string, string>,
  settings: Settings,
  textNodeHandler: TextNodeHandler,
) {
  const elementChildren = Stream.from(document.childNodes)
    .map((node) => (isElement(node) ? node : null))
    .filterNonNull()
    .toArray()
  const root = elementChildren[0]
  if (elementChildren.length !== 1 || !root) {
    throw new Error('Expected exactly one root element')
  }
  const model = new GraphModel(metamodel, settings)
  const rootNode = model.createRootNode(root.tagName)
  initNodeFromElement(rootNode, root, textNodeHandler)
  return model
}

function createNodeFromElement(
  model: GraphModel,
  element: Element,
  textNodeHandler: TextNodeHandler,
): GraphNode {
  const node = model.addNode(element.tagName)
  initNodeFromElement(node, element, textNodeHandler)
  return node
}

function initNodeFromElement(
  node: GraphNode,
  element: Element,
  textNodeHandler: TextNodeHandler,
) {
  Stream.fromObject(element.attribs)
    .map(mapAttribute)
    .forEach((attribute) => node.addAttribute(attribute, true))
  Stream.from(element.childNodes).forEach((child) => {
    if (isElement(child)) {
      const childNode = createNodeFromElement(
        node.model,
        child,
        textNodeHandler,
      )
      node.addChild(childNode)
      return
    }
    if (isText(child)) {
      const text = child.data.trim()
      if (text === '') {
        return
      }
      textNodeHandler(node, text)
    }
  })
}

function mapAttribute([name, value]: [string, string]): Attribute {
  const xmlValue = mapValue(value)
  const parsedName = parseNamespace(name)
  if (typeof parsedName === 'object') {
    return {
      name,
      simpleName: parsedName.name,
      namespace: parsedName.namespace,
      type: 'unknown',
      value: xmlValue,
    }
  }
  return { name, type: 'unknown', value: xmlValue }
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
