import { useAppState } from '../../lib/useAppState'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../ui/resizable'

import { SelectionDetails } from './Details'
import { IRGraph } from './IRGraph'
import { ModelForm } from './ModelForm'

export interface Props {}

export function Model(_: Props) {
  const { model, setModel } = useAppState()
  return (
    <>
      {model ? (
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel defaultSize={70}>
            <IRGraph model={model} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <div className="h-full overflow-auto">
              <SelectionDetails />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="h-full p-2">
          <ModelForm setModel={setModel} />
        </div>
      )}
    </>
  )
}
