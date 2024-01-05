import { useModelState } from '../../lib/useModelState'
import { Hint } from '../ui/hint'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../ui/resizable'

import { SelectionDetails } from './Details'
import { IRGraph } from './IRGraph'

export function Model() {
  const model = useModelState.use.model()

  if (!model) {
    return <Hint text="No model" />
  }

  return (
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
  )
}
