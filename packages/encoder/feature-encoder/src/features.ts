import type { Attributable, AttributeName, AttributeType, GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { Encoder } from './encoder'
import { CategoryEncoder, EncoderProvider } from './encoder'

export type RawFeatureType = AttributeType

function toEncodedFeatureType(type: RawFeatureType): EncodedFeatureType {
  if (type === 'unknown') {
    throw new Error('Cannot encode unknown feature')
  }
  return `encoded-${type}`
}

export type EncodedFeatureType = `encoded-${Exclude<RawFeatureType, 'unknown'>}`

export type FeatureType = RawFeatureType | EncodedFeatureType

export type FeatureName = AttributeName

/**
 * A feature metadata tuple.
 * The first item is the name of the attribute corresponding to the feature.
 * The second item is the type of the attribute corresponding to the feature.
 */
export type FeatureMetadata = (readonly [FeatureName, FeatureType, Encoder | undefined])[]

/**
 * A feature vector.
 * null values indicate missing features.
 * The index of the feature corresponds to the index of the feature metadata tuple.
 */
export type FeatureVector = (number | string | null)[]

export function deriveFeatures(models: GraphModel[]) {
  const nodes = Stream.from(models).flatMap(({ nodes }) => nodes)
  const edges = Stream.from(models).flatMap(({ edges }) => edges)
  const nodeFeatures = getFeatureMetadata(nodes)
  const edgeFeatures = getFeatureMetadata(edges)
  const edgeFeaturesWithoutTag = [...edgeFeatures]
  edgeFeatures.push(['tag', 'category', new CategoryEncoder()])
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
  const uniqueFeaturesKeys = new Set<string>()
  const encoderProvider = new EncoderProvider()
  return attributables
    .flatMap((attributable) => Stream.from(attributable.attributes))
    .map(([name, { type, value }]) => {
      const encoder = encoderProvider.getEncoder(name, type)
      encoder?.fit(value.literal)
      return [name, encoder ? toEncodedFeatureType(type) : type, encoder] as const
    })
    .filter(([name, type]) => {
      const key = `${name}:${type}`
      if (!uniqueFeaturesKeys.has(key)) {
        uniqueFeaturesKeys.add(key)
        return true
      }
      return false
    })
    .toArray()
    .sort(([a], [b]) => a.localeCompare(b))
}

function createFeatureVectorFromMetadata(template: FeatureMetadata, attributable: Attributable): FeatureVector {
  return template.map(([attributeName, type, encoder]) => {
    const attribute = attributable.getAttribute(attributeName)
    if (attribute === undefined) {
      return null
    }
    if (attribute.type !== type.replace('encoded-', '')) {
      return null
    }
    const value = attribute.value.literal
    if (!encoder) {
      return value
    }
    return encoder.transform(value)
  })
}
