import type { FeatureVector as FeatureVectorType, SerializableFeatureMetadata } from '@cm2ml/builtin'
import { useMemo } from 'react'

export interface FeatureVectorProps {
  data: FeatureVectorType | SerializableFeatureMetadata
}

export function FeatureVector({ data }: FeatureVectorProps) {
  const features = useMemo(() => {
    if (isFeatureMetadata(data)) {
      return data.map(([feature, type]) => `${feature} (${type})`)
    }
    return data
  }, [data])

  function formatIndex(index: number) {
    // pad index to always have the same length
    return index.toString().padStart((features.length - 1).toString().length, ' ')
  }
  return (
    <div className="flex flex-col flex-wrap font-mono text-xs">
      {features.map((feature, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className="flex flex-wrap gap-1">
          <span className="text-primary-foreground">
            [
            {formatIndex(index)}
            ]
          </span>
          <span className="text-secondary-foreground">{feature ?? 'null'}</span>
        </div>
      ))}
    </div>
  )
}

function isFeatureMetadata(data: FeatureVectorType | SerializableFeatureMetadata): data is SerializableFeatureMetadata {
  return Array.isArray(data[0])
}
