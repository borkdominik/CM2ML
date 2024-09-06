import type { GraphModel, GraphNode } from '@cm2ml/ir'

import type { PathData } from './paths'
import type { Template } from './template'
import { compileTemplate } from './template'

export function encodePaths(paths: PathData[], model: GraphModel, templates: readonly string[]) {
  const nodes = [...model.nodes]
  const compiledTemplates = templates.map((template) => compileTemplate(template))
  return paths.map((path) => encodePath(path, nodes, compiledTemplates))
}

function encodePath(path: PathData, nodes: GraphNode[], templates: Template[]) {
  const parts: string[] = []
  for (const step of path.steps) {
    const node = nodes[step]
    if (!node) {
      throw new Error(`Node index out-of-bounds. This is an internal error.`)
    }
    const mapper = templates.find((template) => template.isApplicable(node))
    const mapped = mapper?.apply(node)
    if (mapped !== undefined) {
      parts.push(mapped)
    }
  }
  // TODO/Jan: Also encode the edges
  return parts.join(' -> ')
}
