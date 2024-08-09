import { useMemo } from 'react'

import { useModelState } from '../../lib/useModelState'
import { useSettings } from '../../lib/useSettings'
import { Hint } from '../ui/hint'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../ui/resizable'

import { SelectionDetails } from './Details'
import { IRGraph } from './graph/IRGraph'
import { IRTree } from './tree/IRTree'

export function Model() {
  const model = useModelState.use.model()

  const IRView = useIRView()

  if (!model) {
    return <Hint text="No model" />
  }

  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      <ResizablePanel defaultSize={70}>
        <IRView model={model} />
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

function useIRView() {
  const irView = useSettings.use.irView()
  return useMemo(() => {
    if (irView === 'graph') {
      return IRGraph
    }
    if (irView === 'tree') {
      return IRTree
    }
    throw new Error(`Unknown IR view: ${irView}`)
  }, [irView])
}
