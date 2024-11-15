import type { GraphEdge, GraphModel, GraphNode, ModelMember } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { CompiledTemplates } from './bop-types'
import { MultiCache } from './multi-cache'
import type { PathData } from './paths'
import type { PathContext, Template } from './templates/model'

export type EncodedModelMember = string | null

export interface EncodedPath {
  nodes: (readonly [number, EncodedModelMember])[]
  edges: EncodedModelMember[]
  weight: number
  stepWeights: number[]
}

type NodeCache = MultiCache<string, GraphNode, readonly [number, EncodedModelMember]>
type EdgeCache = MultiCache<string, GraphEdge, EncodedModelMember>

export function encodePaths(paths: PathData[], model: GraphModel, compiledTemplates: Omit<CompiledTemplates, 'stepWeighting'>): EncodedPath[] {
  const nodeCache: NodeCache = new MultiCache()
  const edgeCache: EdgeCache = new MultiCache()
  const indexMap = new Map([...model.nodes].map((node, i) => [node, i]))
  const getNodeIndex = (node: GraphNode) => indexMap.get(node)!
  return paths.map((path) => encodePath(
    path,
    getNodeIndex,
    compiledTemplates.nodeTemplates,
    compiledTemplates.edgeTemplates,
    nodeCache,
    edgeCache,
  ))
}

function encodePath(path: PathData, getNodeIndex: (node: GraphNode) => number, nodeTemplates: Template<GraphNode>[], edgeTemplates: Template<GraphEdge>[], nodeCache: NodeCache, edgeCache: EdgeCache): EncodedPath {
  const nodeParts: (readonly [number, EncodedModelMember])[] = []
  const edgeParts: EncodedModelMember[] = []

  path.steps.forEach((step, stepIndex) => {
    const context: PathContext = { step: stepIndex, length: path.steps.length - 1 }
    const contextKey = JSON.stringify(context)
    const via = step.via
    if (via !== undefined) {
      const edgeEncoding = edgeCache.compute(contextKey, via, () => applyTemplates(via, edgeTemplates, context))
      edgeParts.push(edgeEncoding)
    }
    const nodeEncoding = nodeCache.compute(contextKey, step.node, () => [getNodeIndex(step.node), applyTemplates(step.node, nodeTemplates, context)])
    nodeParts.push(nodeEncoding)
  })
  return { nodes: nodeParts, edges: edgeParts, stepWeights: path.stepWeights, weight: path.weight }
}

function applyTemplates<T extends ModelMember>(element: T, templates: Template<T>[], context: PathContext): EncodedModelMember {
  return Stream.from(templates).map((template) => template(element, context)).find((part) => part !== undefined) ?? null
}
