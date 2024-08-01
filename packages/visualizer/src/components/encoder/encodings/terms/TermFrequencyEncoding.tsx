import { TermFrequencyEncoder } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'

import type { ParameterValues } from '../../../Parameters'
import { Hint } from '../../../ui/hint'
import { useEncoder } from '../../useEncoder'

export interface Props {
  model: GraphModel
  parameters: ParameterValues
}

export function TermFrequencyEncoding({ model, parameters }: Props) {
  const { encoding, error } = useEncoder(TermFrequencyEncoder, model, parameters)
  if (error || !encoding) {
    return <Hint error={error} />
  }
  // const { termDocumentMatrix, termList } = encoding.metadata

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold">Term Frequency Encoding</h2>
      <div className="overflow-x-auto">
        TODO
        {/* {termList.map((term, index) => (<p>{term}</p>))} */}
      </div>
    </div>
  )
}
