import type { GraphModel } from '@cm2ml/ir'
import type { ParameterValues } from '../../Parameters'
import { useMemo } from 'react'
import { OneHotEncoder } from '@cm2ml/builtin'
import { Hint } from '../../ui/hint'


export interface Props {
    model: GraphModel
    parameters: ParameterValues
}

export function OneHotEncoding({ model, parameters }: Props) {
    const { encoding, error } = useOneHotEncoding(model, parameters)
    console.log(encoding)
    if (error || !encoding) {
        return <Hint error={error} />
    }
    
    return (
        <div className="h-full p-2">
            {encoding[0]}<br/>
            {encoding[1]}<br/>
            {encoding[2]}<br/>
        </div>
    )
}

function useOneHotEncoding(model: GraphModel, parameters: ParameterValues) {
    return useMemo(() => {
      try {
        return { encoding: OneHotEncoder.validateAndInvoke(model, parameters) }
      } catch (error) {
        return { error }
      }
    }, [model, parameters])
  }