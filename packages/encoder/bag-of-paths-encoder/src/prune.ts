import type { EncodedPath } from './encoding'

export const pruneMethods = ['none', 'node', 'encoding'] as const

export type PruneMethod = typeof pruneMethods[number]

export function prunePaths(paths: EncodedPath[], method: PruneMethod): EncodedPath[] {
  if (method === 'none') {
    return paths
  }
  const pathsToPrune = new Set<EncodedPath>()
  for (const path of paths) {
    if (pathsToPrune.has(path)) {
      continue
    }
    const pathsToCheck = paths.filter((other) => other !== path && !pathsToPrune.has(other))
    const newToPrune = prunePathsWithTarget(path, pathsToCheck, method)
    newToPrune.forEach((path) => pathsToPrune.add(path))
  }
  return paths.filter((path) => !pathsToPrune.has(path))
}

function prunePathsWithTarget(a: EncodedPath, otherPaths: EncodedPath[], method: PruneMethod) {
  const pathsToPrune = new Set<EncodedPath>()
  const pathsToCheck = new Set(otherPaths)
  pathsToCheck.delete(a)
  for (const b of pathsToCheck) {
    if (pathsToPrune.has(b)) {
      continue
    }
    if (b.nodes.length > a.nodes.length && comparePaths(a, b, method)) {
      pathsToPrune.add(a)
      return pathsToPrune
    }
    if (a.nodes.length >= b.nodes.length && comparePaths(b, a, method)) {
      pathsToPrune.add(b)
    }
  }
  return pathsToPrune
}

/**
 * Check if a is included b.
 * Note: a must not be longer than b!
 */
function comparePaths(a: EncodedPath, b: EncodedPath, method: PruneMethod) {
  if (a.nodes.length > b.nodes.length) {
    throw new Error('Invalid usage. The first argument must be the shorter path! This is an internal error.')
  }
  for (let bStep = 0; bStep < b.nodes.length; bStep++) {
    for (let aStep = 0; aStep < a.nodes.length; aStep++) {
      const bNode = b.nodes[bStep + aStep]
      const bEdge = b.edges[bStep + aStep]

      const aNode = a.nodes[aStep]
      const aEdge = a.edges[aStep]
      const nodesLeftInA = a.nodes.length - aStep - 1

      if (bNode === undefined && aNode !== undefined) {
        // b is exhausted, but a is not
        return false
      }

      // is same node AND (is same edge OR (no more edges in a AND end of a is reached))
      const isSame = isSameNode(aNode, bNode, method) && (aEdge === bEdge || (aEdge === undefined && nodesLeftInA === 0))
      if (!isSame) {
        // No match here, continue with next step of b
        break
      }
      if (nodesLeftInA === 0) {
        // Reached end of a, and all of its steps are a subsequence in b
        return true
      }
    }
  }
  return false
}

function isSameNode(a: EncodedPath['nodes'][number] | undefined, b: EncodedPath['nodes'][number] | undefined, method: PruneMethod) {
  if (a === undefined && b === undefined) {
    return true
  }
  if (a === undefined || b === undefined) {
    return false
  }
  const sameEncoding = a[1] === b[1]
  if (method === 'encoding') {
    return sameEncoding
  }
  return sameEncoding && a[0] === b[0]
}
