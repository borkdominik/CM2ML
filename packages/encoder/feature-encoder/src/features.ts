import { type Attributable, type Attribute, type AttributeName, AttributeTypeSchema, type GraphEdge, type GraphModel, type GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import { z } from 'zod'

import type { Encoder, FeatureEncoderProviderSettings } from './encoder'
import { FeatureEncoderProvider } from './encoder'

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

export const FeatureMetadataSchema = z.array(z.tuple([z.string(), FeatureTypeSchema, z.record(z.number()).nullable()]))

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

export interface FeatureDeriverSettings extends FeatureEncoderProviderSettings {
  onlyEncodedFeatures: boolean
  nodeFeatureOverride: FeatureMetadata | null
  edgeFeatureOverride: FeatureMetadata | null
}

export type FeatureContext = ReturnType<typeof deriveFeatures>

export function deriveFeatures(models: GraphModel[], settings: FeatureDeriverSettings) {
  const nodes = Stream.from(models).flatMap(({ nodes }) => nodes).cache()
  const edges = Stream.from(models).flatMap(({ edges }) => edges).cache()
  const { template: internalNodeFeatures, encoderProvider: nodeEncoderProvider } = getFeatureMetadata(nodes, settings, settings.nodeFeatureOverride)
  const { template: internalEdgeFeatures, encoderProvider: edgeEncoderProvider } = getFeatureMetadata(edges, settings, settings.edgeFeatureOverride)
  // Omit encoder from feature metadata to prevent leaking of internals
  const nodeFeatures: FeatureMetadata = internalNodeFeatures.map(([name, type, encoder]) => [name, type, encoder?.export?.() ?? null] as const)
  const edgeFeatures: FeatureMetadata = internalEdgeFeatures.map(([name, type, encoder]) => [name, type, encoder?.export?.() ?? null] as const)

  return {
    edgeFeatures,
    nodeFeatures,
    onlyEncodedFeatures: settings.onlyEncodedFeatures,
    canEncodeNodeAttribute: (attribute: Attribute) => nodeEncoderProvider.canEncodeAttribute(attribute),
    canEncodeEdgeAttribute: (attribute: Attribute) => edgeEncoderProvider.canEncodeAttribute(attribute),
    mapNodeAttribute: createAttributeMapper(nodeEncoderProvider),
    mapEdgeAttribute: createAttributeMapper(edgeEncoderProvider),
    getNodeFeatureVector: (node: GraphNode) => createFeatureVectorFromMetadata(internalNodeFeatures, node),
    getEdgeFeatureVector: (edge: GraphEdge) => createFeatureVectorFromMetadata(internalEdgeFeatures, edge),
  }
}

export type FeatureEncoderRegistry = ReturnType<typeof createEncoderRegistry>

function registryKey(source: Attribute | InternalFeatureMetadata[number]) {
  if (Array.isArray(source)) {
    const [name, type] = source
    return `${name}-${toRawFeatureType(type)}`
  }
  const attribute = source as Attribute
  return `${attribute.name}-${attribute.type}`
}

function createEncoderRegistry(template: InternalFeatureMetadata) {
  return Object.fromEntries(template.map((entry) => ([registryKey(entry), entry[2]])))
}

function createAttributeMapper(encoderProvider: FeatureEncoderProvider) {
  return (attribute: Attribute) => {
    const encoder = encoderProvider.getEncoder(attribute.name, attribute.type)
    const value = attribute.value.literal
    if (!encoder) {
      return value
    }
    return encoder.transform(value)
  }
}

function getFeatureMetadata(attributables: Stream<Attributable>, settings: FeatureDeriverSettings, override: FeatureMetadata | null): { template: InternalFeatureMetadata, encoderProvider: FeatureEncoderProvider } {
  function toKey(name: FeatureName, type: FeatureType) {
    return `${name}:${type}`
  }
  const encoderProvider = new FeatureEncoderProvider(settings)

  const uniqueFeaturesKeys = new Set<string>()

  const resolvedOverride = Stream.from(override ?? [])
    .map(([name, type, data]) => {
      const rawType = isEncodedFeatureType(type) ? toRawFeatureType(type) : type
      const encoder = encoderProvider.getOrCreateEncoder(name, rawType)
      if (encoder && data !== null) {
        encoder.import?.(data)
      }
      uniqueFeaturesKeys.add(toKey(name, rawType))
      return [name, encoder ? toEncodedFeatureType(rawType) : rawType, encoder] as const
    })
    .toArray()

  const allowedFeatures: ReadonlySet<string> | null = Stream
    .from(resolvedOverride)
    .map(([name, type]) => toKey(name, isEncodedFeatureType(type) ? toRawFeatureType(type) : type))
    .toSet()

  const isFeatureAllowed = (name: FeatureName, type: FeatureType) => allowedFeatures.size === 0 || allowedFeatures.has(toKey(name, type))

  const featureMetadata = attributables
    .flatMap((attributable) => Stream.from(attributable.attributes))
    .map(([name, { type, value }]) => {
      if (!isFeatureAllowed(name, type)) {
        // I.e., the feature is not present in the override
        return null
      }
      const encoder = encoderProvider.getOrCreateEncoder(name, type)
      if (settings.onlyEncodedFeatures && !encoder) {
        return null
      }
      encoder?.fit?.(value.literal)
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

  if (resolvedOverride.length > 0) {
    return { template: resolvedOverride, encoderProvider }
  }

  return { template: featureMetadata.sort(([a], [b]) => a.localeCompare(b)), encoderProvider }
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
