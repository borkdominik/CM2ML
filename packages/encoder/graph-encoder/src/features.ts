import type { Attributable, AttributeName, GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

export type FeatureVectorTemplate = AttributeName[]

export function batchFeatureVectors(models: GraphModel[]) {
  const nodes = Stream.from(models).flatMap(({ nodes }) => nodes)
  const edges = Stream.from(models).flatMap(({ edges }) => edges)
  const nodeFeatures = getFeatureVectorTemplate(nodes)
  const edgeFeatures = getFeatureVectorTemplate(edges)
  return {
    nodeFeatures,
    nodeFeatureVector: (node: GraphNode) => createFeatureVectorFromTemplate(nodeFeatures, node),
    edgeFeatures,
    edgeFeatureVector: (edge: GraphEdge) => createFeatureVectorFromTemplate(edgeFeatures, edge),
  }
}

function getFeatureVectorTemplate(attributables: Stream<Attributable>): FeatureVectorTemplate {
  return attributables
    .flatMap((attributable) => Stream.from(attributable.attributes))
    .map(([attributeName]) => attributeName)
    .distinct()
    .toArray()
    .sort()
}

function createFeatureVectorFromTemplate(template: FeatureVectorTemplate, attributable: Attributable) {
  return template.map((attributeName) => attributable.getAttribute(attributeName)?.value.literal ?? null)
}
