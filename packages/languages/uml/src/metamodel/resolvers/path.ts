import type { GraphModel, GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'

export function resolvePath(model: GraphModel, path: string) {
  if (path.startsWith('//')) {
    return resolveAbsolutePath(model, path)
  }
  return undefined
  // throw new Error(`Unsupported path: ${path}`)
}

function resolveAbsolutePath(model: GraphModel, path: string) {
  const segments = path.replace('//', '').split('/')
  const root = model.root
  return resolveSegments(root, segments)
}

function resolveSegments(node: GraphNode, segments: string[]) {
  const segment = segments[0]

  if (!segment) {
    // We are at the end of the path but don't have a match
    return undefined
  }

  const nextNode = resolveTaggedSegment(node, segment) ?? resolveIndexedSegment(node, segment, matchName) ?? node.findChild(matchName(segment))
  if (!nextNode) {
    return undefined
  }

  if (segments.length === 1) {
    // We have reached the end of the path and have a match
    return nextNode
  }

  return resolveSegments(nextNode, segments.slice(1))
}

function resolveTaggedSegment(node: GraphNode, segment: string) {
  if (!segment.startsWith('@')) {
    return undefined
  }
  const tag = segment.replace('@', '')
  if (tag.includes('.')) {
    return resolveIndexedSegment(node, tag, matchTag)
  }
  const nextNode = node.findChild(matchTag(tag))
  if (!nextNode) {
    return undefined
  }
  return nextNode
}

function resolveIndexedSegment(node: GraphNode, segment: string, createMatcher: (string: string) => ((node: GraphNode) => boolean)) {
  if (!segment.includes('.')) {
    return undefined
  }

  const [key, index] = segment.split('.')
  if (!key || !index) {
    throw new Error(`Invalid indexed segment: ${segment}`)
  }

  const children = node.findAllChildren(createMatcher(key))

  const child = children[Number(index)]
  if (!child) {
    throw new Error(`No child found for indexed segment: ${segment}`)
  }

  return child
}

export function matchName(name: string) {
  return (node: GraphNode) => node.getAttribute(Uml.Attributes.name)?.value.literal === name
}

export function matchTag(tag: string) {
  return (node: GraphNode) => node.tag === tag
}
