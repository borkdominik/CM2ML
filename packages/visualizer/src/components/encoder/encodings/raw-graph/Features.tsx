import type { FeatureMetadata, FeatureVector as FeatureVectorType } from '@cm2ml/builtin'
import { useMemo } from 'react'

export interface FeatureVectorProps {
  data: FeatureVectorType | FeatureMetadata
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
    <div className="flex flex-col flex-wrap font-mono text-xs text-primary-foreground">
      {features.map((feature, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className="flex flex-wrap gap-1">
          <span>
            [
            {formatIndex(index)}
            ]
          </span>
          <span>{feature ?? 'null'}</span>
        </div>
      ))}
    </div>
  )
}

function isFeatureMetadata(data: FeatureVectorType | FeatureMetadata): data is FeatureMetadata {
  return Array.isArray(data[0])
}
