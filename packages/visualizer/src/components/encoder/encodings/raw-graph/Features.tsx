import type { FeatureVector as FeatureVectorType } from '@cm2ml/builtin'

export interface FeatureVectorProps {
  featureVector: FeatureVectorType
}

export function FeatureVector({ featureVector }: FeatureVectorProps) {
  return (
    <div className="flex flex-col flex-wrap font-mono text-xs">
      {featureVector.map((feature, index) => (
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
