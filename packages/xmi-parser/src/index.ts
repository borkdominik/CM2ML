import type { Attribute, AttributeName, Value } from '@cm2ml/ir'
import { GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { Element } from 'domhandler'
import type { Document, Node } from 'domhandler'
import { parseDocument } from 'htmlparser2'

export const XmiParser = definePlugin({
  name: 'xmi',
  parameters: {},
  invoke: (input: string) => parse(input),
})

function parse(xmi: string) {
  const document = parseDocument(xmi, {
    xmlMode: true,
  })
  return getGraphModel(document)
}

function getGraphModel(document: Document): GraphModel {
  const elementMap = new Map<string, GraphNode>()

  function registerElement(element: GraphNode) {
    const id = element.getAttribute('id')
    if (id === undefined) {
      return
    }
    if (elementMap.has(id.value.literal)) {
      throw new Error(`Duplicate element with id ${id.value.literal}`)
    }
    elementMap.set(id.value.literal, element)
  }

  function getReference(element: GraphNode) {
    const source = getNearestIdentifiableElement(element)
    if (source === null) {
      return
    }
    const idref = element.getAttribute('idref')
    if (idref === undefined) {
      return
    }
    const target = elementMap.get(idref.value.literal)
    if (target === undefined) {
      throw new Error(`Missing target element with id ${idref.value.literal}`)
    }
    target.referencedBy.add(source)
    return new GraphEdge(element, source, target)
  }

  const root = mapDocument(document)
  const elements = collectAllElements(root).forEach(registerElement).toArray()

  const references = Stream.from(elements)
    .map(getReference)
    .filterNonNull()
    .toArray()

  return new GraphModel(root, elements, references)
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
  return { name: rest.join(':'), value: xmiValue, namespace }
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

function getNearestIdentifiableElement(element: GraphNode) {
  if (getId(element) !== undefined) {
    return element
  }
  let target = element.parent
  while (target !== null && getId(target) === undefined) {
    target = target.parent
  }
  return target
}

function getId(element: GraphNode): string | undefined {
  return element.getAttribute('id')?.value.literal
}
