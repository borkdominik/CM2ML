import { type Attributable, type AttributeName, AttributeTypeSchema, type GraphEdge, type GraphModel, type GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import { z } from 'zod'

import type { Encoder, EncoderProviderSettings } from './encoder'
import { EncoderProvider } from './encoder'

export const RawFeatureTypeSchema = AttributeTypeSchema

export type RawFeatureType = z.infer<typeof RawFeatureTypeSchema>

function toEncodedFeatureType(type: RawFeatureType): EncodedFeatureType {
  if (type === 'unknown') {
    throw new Error('Cannot encode unknown feature')
  }
  return `encoded-${type}`
}

function toRawFeatureType(type: EncodedFeatureType): RawFeatureType {
  return type.replace('encoded-', '') as RawFeatureType
}

function isEncodedFeatureType(type: FeatureType): type is EncodedFeatureType {
  return type.startsWith('encoded-')
}

export const EncodedFeatureTypeSchema = z.enum(['encoded-category', 'encoded-boolean', 'encoded-integer', 'encoded-float', 'encoded-string'])

export type EncodedFeatureType = z.infer<typeof EncodedFeatureTypeSchema>

export const FeatureTypeSchema = z.union([RawFeatureTypeSchema, EncodedFeatureTypeSchema])

export type FeatureType = z.infer<typeof FeatureTypeSchema>

export type FeatureName = AttributeName

export const FeatureMetadataSchema = z.array(z.tuple([z.string(), FeatureTypeSchema]))

export type FeatureMetadata = z.infer<typeof FeatureMetadataSchema>// (readonly [FeatureName, FeatureType])[]

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
  nodeFeatureOverride: FeatureMetadata | null
  edgeFeatureOverride: FeatureMetadata | null
}

export function deriveFeatures(models: GraphModel[], settings: FeatureDeriverSettings) {
  const nodes = Stream.from(models).flatMap(({ nodes }) => nodes)
  const edges = Stream.from(models).flatMap(({ edges }) => edges)
  const internalNodeFeatures = getFeatureMetadata(nodes, settings, settings.nodeFeatureOverride)
  const internalEdgeFeatures = getFeatureMetadata(edges, settings, settings.edgeFeatureOverride)
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

function getFeatureMetadata(attributables: Stream<Attributable>, settings: FeatureDeriverSettings, override: FeatureMetadata | null): InternalFeatureMetadata {
  function toKey(name: FeatureName, type: FeatureType) {
    return `${name}:${type}`
  }
  const allowedFeatures: ReadonlySet<string> | null = override ? new Set(override.map(([name, type]) => toKey(name, isEncodedFeatureType(type) ? toRawFeatureType(type) : type))) : null
  const isFeatureAllowed = (name: FeatureName, type: FeatureType) => !allowedFeatures || allowedFeatures.has(toKey(name, type))
  const uniqueFeaturesKeys = new Set<string>()
  const encoderProvider = new EncoderProvider(settings)
  const featureMetadata = attributables
    .flatMap((attributable) => Stream.from(attributable.attributes))
    .map(([name, { type, value }]) => {
      if (!isFeatureAllowed(name, type)) {
        // I.e., the feature is not present in the override
        return null
      }
      const encoder = encoderProvider.getEncoder(name, type)
      if (settings.onlyEncodedFeatures && !encoder) {
        return null
      }
      encoder?.fit(value.literal)
      return [name, encoder ? toEncodedFeatureType(type) : type, encoder] as const
    })
    .filterNonNull()
    .filter(([name, type]) => {
      const key = toKey(name, type)
      if (uniqueFeaturesKeys.has(key)) {
        // The feature was already registered by another attributable,
        // remove if from the stream to prevent duplication
        return false
      }
      uniqueFeaturesKeys.add(key)
      return true
    })
    .toArray()
  if (override) {
    override.forEach(([name, type]) => {
      // Get the raw type to check if the feature is being encoded
      const rawType = isEncodedFeatureType(type) ? toRawFeatureType(type) : type
      // Check if the feature is being encoded.
      // It does NOT suffice to check if there is an encoder for the feature,
      // since the feature could be absent from the attributables.
      const finalType = encoderProvider.canEncode(rawType) ? toEncodedFeatureType(rawType) : rawType
      const encoder = encoderProvider.getEncoder(name, rawType)
      if (settings.onlyEncodedFeatures && !encoder) {
        return
      }
      if (!uniqueFeaturesKeys.has(toKey(name, finalType))) {
        featureMetadata.push([name, finalType, encoder])
      }
    })
  }
  return featureMetadata.sort(([a], [b]) => a.localeCompare(b))
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
