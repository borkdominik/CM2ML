import type { XmiAttribute, XmiAttributeName, XmiValue } from '@cm2ml/xmi-model'
import { XmiElement, XmiModel, XmiRelationship } from '@cm2ml/xmi-model'
import { Stream } from '@yeger/streams'
import { Element } from 'domhandler'
import type { Document, Node } from 'domhandler'
import { parseDocument } from 'htmlparser2'

export function parse(xmi: string) {
  const document = parseDocument(xmi, {
    xmlMode: true,
  })
  return getModel(document)
}

function getModel(document: Document): XmiModel {
  const elementMap = new Map<string, XmiElement>()

  function mapDocument(document: Document) {
    return Stream.from(document.childNodes)
      .map((child) => (isElement(child) ? mapElement(child) : null))
      .filterNonNull()
  }

  function mapAttributes(
    attributes: Record<string, string>
  ): Record<XmiAttributeName, XmiAttribute> {
    return Stream.fromObject(attributes)
      .map(mapAttribute)
      .toRecord(
        ({ name }) => name,
        (attribute) => attribute
      )
  }

  function mapAttribute([name, value]: [string, string]): XmiAttribute {
    const xmiValue = mapValue(value)
    if (!name.includes(':')) {
      return { name, value: xmiValue }
    }
    const [namespace, ...rest] = name.split(':')
    return { name: rest.join(':'), value: xmiValue, namespace }
  }

  function mapValue(value: string): XmiValue {
    if (!value.includes(':')) {
      return { literal: value }
    }
    const [namespace, ...rest] = value.split(':')
    return { literal: rest.join(':'), namespace }
  }

  function mapElement(element: Element): XmiElement | null {
    const attributes = mapAttributes(element.attribs)
    const children = Stream.from(element.childNodes)
      .map((child) => (isElement(child) ? mapElement(child) : null))
      .filterNonNull()
      .toArray()
    const xmiElement = new XmiElement(element.tagName, attributes, children)
    children.forEach((child) => (child.parent = xmiElement))
    registerElement(xmiElement)
    return xmiElement
  }

  function registerElement(element: XmiElement) {
    const id = element.getAttribute('id')
    if (id === undefined) {
      return
    }
    elementMap.set(id.value.literal, element)
  }

  function isElement(node: Node): node is Element {
    return node.type === 'tag' || node instanceof Element
  }

  function collectAllElements(element: XmiElement): Stream<XmiElement> {
    return Stream.from(element.children)
      .flatMap(collectAllElements)
      .append(element)
  }

  function getRelationship(element: XmiElement) {
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
    return new XmiRelationship(element.tag, source, target)
  }

  const elements = mapDocument(document).flatMap(collectAllElements).toArray()

  const relationships = Stream.from(elements)
    .map(getRelationship)
    .filterNonNull()
    .toArray()

  return new XmiModel(elements, relationships)
}

function getId(element: XmiElement): string | undefined {
  return element.getAttribute('id')?.value.literal
}

function getNearestIdentifiableElement(element: XmiElement) {
  if (getId(element) !== undefined) {
    return element
  }
  let target = element.parent
  while (target !== null && getId(target) === undefined) {
    target = target.parent
  }
  return target
}
