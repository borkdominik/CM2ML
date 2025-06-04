import type { GraphModel } from '@cm2ml/ir'

import { Archimate } from './metamodel/archimate'

// Pruning functions to remove nodes and edges based on whitelist and blacklist criteria
// Reused from UML Parser see: `@cm2ml/languages/uml/src/uml-parser.ts`

export function pruneNodes(model: GraphModel, whitelist: readonly string[], blacklist: readonly string[]) {
  const whitelistSet = new Set(whitelist)
  const blacklistSet = new Set(blacklist)
  model.nodes.forEach((node) => {
    if (node === model.root) {
      return
    }
    const nodeType = Archimate.getType(node)
    if (!nodeType) {
      return
    }
    const passesBlacklist = !blacklistSet.has(nodeType)
    const passesWhitelist = whitelistSet.size === 0 || whitelistSet.has(nodeType)
    if (passesBlacklist && passesWhitelist) {
      return
    }
    model.debug('Parser', `Removing non-whitelisted node with type ${node.type ?? node.tag}`)
    model.removeNode(node, true)
  })
}

export function pruneEdges(model: GraphModel, whitelist: readonly string[], blacklist: readonly string[]) {
  const whitelistSet = new Set(whitelist)
  const blacklistSet = new Set(blacklist)
  model.edges.forEach((edge) => {
    const passesBlacklist = !blacklistSet.has(edge.tag)
    const passesWhitelist = whitelistSet.size === 0 || whitelistSet.has(edge.tag)
    if (passesBlacklist && passesWhitelist) {
      return
    }
    model.debug('Parser', `Removing non-whitelisted edge with tag ${edge.tag}`)
    model.removeEdge(edge)
  })
}
