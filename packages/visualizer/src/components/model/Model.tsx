import { useAppState } from '../../lib/useAppState'

import { IRGraph } from './IRGraph'
import { ModelForm } from './ModelForm'

export interface Props {}

export function Model(_: Props) {
  const { model, setModel } = useAppState()
  return (
    <>
      {model ? (
        <IRGraph model={model} />
      ) : (
        <div className="h-full p-2">
          <ModelForm setModel={setModel} />
        </div>
      )}
    </>
  )
}
