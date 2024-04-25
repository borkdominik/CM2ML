import type { FeatureMetadata, FeatureVector as FeatureVectorType } from '@cm2ml/builtin'
import { useMemo } from 'react'

export interface FeatureVectorProps {
  data: FeatureMetadata | FeatureVectorType
}

export function FeatureVector({ data }: FeatureVectorProps) {
  const features = useMemo(() => {
    if (isFeatureMetadata(data)) {
      return data.map(([feature, type]) => `${feature} (${type})`)
    }
    return data
  }, [data])
  return (
    <div className="flex flex-col flex-wrap font-mono text-xs">
      {features.map((feature, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className="flex flex-wrap gap-1">
          <span className="text-primary-foreground">
            [
            {index}
            ]
          </span>
          <span className="text-secondary-foreground">{feature ?? 'null'}</span>
        </div>
      ))}
    </div>
  )
}

function isFeatureMetadata(data: FeatureMetadata | FeatureVectorType): data is FeatureMetadata {
  return Array.isArray(data[0])
}
