import type { GraphEdge, GraphModel, GraphNode, ModelMember } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { BoPEncodingParameters } from './bop-types'
import type { PathData } from './paths'
import type { PathContext, Template } from './templates/model'
import { compileNodeTemplate, compileEdgeTemplate } from './templates/parser'

export type EncodedModelMember = string | null

export interface EncodedPath {
  nodes: (readonly [number, EncodedModelMember])[]
  edges: EncodedModelMember[]
  weight: number
  stepWeights: number[]
}

export function encodePaths(paths: PathData[], model: GraphModel, parameters: BoPEncodingParameters): EncodedPath[] {
  const compiledNodeTemplates = parameters.nodeTemplates.map((template) => compileNodeTemplate(template))
  const compiledEdgeTemplates = parameters.edgeTemplates.map((template) => compileEdgeTemplate(template))
  const nodeCache: NodeCache = new MultiCache()
  const edgeCache: EdgeCache = new MultiCache()

  const indexMap = new Map([...model.nodes].map((node, i) => [node, i]))
  const getNodeIndex = (node: GraphNode) => indexMap.get(node)!
  return paths.map((path) => encodePath(path, getNodeIndex, compiledNodeTemplates, compiledEdgeTemplates, nodeCache, edgeCache))
}

type NodeCache = MultiCache<string, GraphNode, readonly [number, EncodedModelMember]>
type EdgeCache = MultiCache<string, GraphEdge, EncodedModelMember>

class MultiCache<OK, IK, V> {
  private readonly cache: Map<OK, Map<IK, V>> = new Map()

  public compute(outerKey: OK, innerKey: IK, fallback: () => V): V {
    if (!this.cache.has(outerKey)) {
      this.cache.set(outerKey, new Map())
    }
    const cachedValue = this.cache.get(outerKey)?.get(innerKey)
    if (cachedValue !== undefined) {
      return cachedValue
    }
    const value = fallback()
    this.cache.get(outerKey)!.set(innerKey, value)
    return value
  }
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
