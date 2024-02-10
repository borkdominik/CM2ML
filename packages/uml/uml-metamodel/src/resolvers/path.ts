import type { GraphModel, GraphNode } from '@cm2ml/ir'

export function resolvePath(model: GraphModel, path: string) {
  if (path.startsWith('//')) {
    return resolveAbsolutePath(model, path)
  }
  throw new Error(`Unsupported path: ${path}`)
}

function resolveAbsolutePath(model: GraphModel, path: string) {
  const segments = path.replace('//', '').split('/')
  const root = model.root
  return resolveLastSegment(root, segments)
}

function resolveLastSegment(node: GraphNode, segments: string[]) {
  const segment = segments[0]

  if (!segment) {
    // We are at the end of the path but don't have a match
    return undefined
  }

  if (segment.includes('.') && segments.length === 1) {
    // We have an indexed path segment as the final segment
    return resolveIndexedSegment(node, segment)
  }

  const nextNode = node.findChild((child) => getNameAttribute(child) === segment)
  if (!nextNode) {
    return undefined
  }

  if (segments.length === 1) {
    // We have reached the end of the path and have a match
    return nextNode
  }

  return resolveLastSegment(nextNode, segments.slice(1))
}

function resolveIndexedSegment(node: GraphNode, segment: string) {
  const [name, index] = segment.split('.')
  if (!name || !index) {
    throw new Error(`Invalid indexed segment: ${segment}`)
  }

  const children = node.findAllChildren((child) => getNameAttribute(child) === name)

  const child = children[Number(index)]
  if (!child) {
    throw new Error(`No child found for indexed segment: ${segment}`)
  }
  return child
}

function getNameAttribute(node: GraphNode) {
  return node.getAttribute('name')?.value.literal
}
