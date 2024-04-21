import type { FeatureVectorTemplate, FeatureVector as FeatureVectorType } from '@cm2ml/builtin'

export interface FeatureVectorProps {
  featureVector: FeatureVectorType | FeatureVectorTemplate
}

export function FeatureVector({ featureVector }: FeatureVectorProps) {
  return (
    <div className="flex flex-col flex-wrap font-mono text-xs">
      {featureVector.map((feature, index) => (
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
