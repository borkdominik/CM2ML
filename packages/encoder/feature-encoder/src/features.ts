import type { Attributable, AttributeName, AttributeType, GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { Encoder, EncoderProviderSettings } from './encoder'
import { EncoderProvider } from './encoder'

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

export type FeatureMetadata = (readonly [FeatureName, FeatureType])[]

/**
 * A feature metadata tuple.
 * The first item is the name of the attribute corresponding to the feature.
 * The second item is the type of the attribute corresponding to the feature.
 */
export type InternalFeatureMetadata = (readonly [FeatureName, FeatureType, Encoder | undefined])[]

/**
 * A feature vector.
 * null values indicate missing features.
 * The index of the feature corresponds to the index of the feature metadata tuple.
 */
export type FeatureVector = (number | string | null)[]

export interface FeatureDeriverSettings extends EncoderProviderSettings {
  onlyEncodedFeatures: boolean
}

export function deriveFeatures(models: GraphModel[], settings: FeatureDeriverSettings) {
  const nodes = Stream.from(models).flatMap(({ nodes }) => nodes)
  const edges = Stream.from(models).flatMap(({ edges }) => edges)
  const internalNodeFeatures = getFeatureMetadata(nodes, settings)
  const internalEdgeFeatures = getFeatureMetadata(edges, settings)
  const nodeFeatures: FeatureMetadata = internalNodeFeatures.map(([name, type]) => [name, type] as const)
  const edgeFeatures: FeatureMetadata = internalEdgeFeatures.map(([name, type]) => [name, type] as const)
  return {
    // Omit encoder from feature metadata to prevent leaking of internals
    edgeFeatures,
    nodeFeatures,
    getNodeFeatureVector: (node: GraphNode) => createFeatureVectorFromMetadata(internalNodeFeatures, node),
    getEdgeFeatureVector: (edge: GraphEdge) => createFeatureVectorFromMetadata(internalEdgeFeatures, edge),
  }
}

function getFeatureMetadata(attributables: Stream<Attributable>, settings: FeatureDeriverSettings): InternalFeatureMetadata {
  const uniqueFeaturesKeys = new Set<string>()
  const encoderProvider = new EncoderProvider(settings)
  return attributables
    .flatMap((attributable) => Stream.from(attributable.attributes))
    .map(([name, { type, value }]) => {
      const encoder = encoderProvider.getEncoder(name, type)
      encoder?.fit(value.literal)
      return [name, encoder ? toEncodedFeatureType(type) : type, encoder] as const
    })
    .filter(([name, type]) => {
      const key = `${name}:${type}`
      if (uniqueFeaturesKeys.has(key)) {
        return false
      }
      if (settings.onlyEncodedFeatures && !type.startsWith('encoded-')) {
        return false
      }
      uniqueFeaturesKeys.add(key)
      return true
    })
    .toArray()
    .sort(([a], [b]) => a.localeCompare(b))
}

function createFeatureVectorFromMetadata(template: InternalFeatureMetadata, attributable: Attributable): FeatureVector {
  return template.map(([attributeName, type, encoder]) => {
    const value = getRawValue(attributable, attributeName, type)
    if (!encoder) {
      return value
    }
    return encoder.transform(value)
  })
}

function getRawValue(attributable: Attributable, name: AttributeName, type: FeatureType) {
  const attribute = attributable.getAttribute(name)
  if (attribute === undefined) {
    return null
  }
  if (attribute.type !== type.replace('encoded-', '')) {
    return null
  }
  return attribute?.value.literal ?? null
}
