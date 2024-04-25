import type { Attributable, AttributeName, AttributeType, GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

/**
 * A feature metadata tuple.
 * The first item is the name of the attribute corresponding to the feature.
 * The second item is the type of the attribute corresponding to the feature.
 */
export type FeatureMetadata = [AttributeName, AttributeType][]

/**
 * A feature vector.
 * null values indicate missing features.
 * The index of the feature corresponds to the index of the feature metadata tuple.
 */
export type FeatureVector = (string | null)[]

export function deriveFeatures(models: GraphModel[]) {
  const nodes = Stream.from(models).flatMap(({ nodes }) => nodes)
  const edges = Stream.from(models).flatMap(({ edges }) => edges)
  const nodeFeatures = getFeatureMetadata(nodes)
  const edgeFeatures = getFeatureMetadata(edges)
  const edgeFeaturesWithoutTag = [...edgeFeatures]
  edgeFeatures.push(['tag', 'category'])
  return {
    nodeFeatures,
    getNodeFeatureVector: (node: GraphNode) => createFeatureVectorFromMetadata(nodeFeatures, node),
    edgeFeatures,
    getEdgeFeatureVector: (edge: GraphEdge) => {
      const featureVector = createFeatureVectorFromMetadata(edgeFeaturesWithoutTag, edge)
      featureVector.push(edge.tag)
      return featureVector
    },
  }
}

function getFeatureMetadata(attributables: Stream<Attributable>): FeatureMetadata {
  // Convert to object to remove duplicates
  return Object.entries(Object.fromEntries(attributables
    .flatMap((attributable) => Stream.from(attributable.attributes))
    .map(([_, { name, type }]) => [name, type] as const)
    .toArray()
    .sort((a, b) => a[0].localeCompare(b[0]))))
}

function createFeatureVectorFromMetadata(template: FeatureMetadata, attributable: Attributable): FeatureVector {
  return template.map(([attributeName]) => attributable.getAttribute(attributeName)?.value.literal ?? null)
}
