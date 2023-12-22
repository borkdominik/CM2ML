import { GraphEncoder } from '@cm2ml/graph-encoder'
import type { GraphModel } from '@cm2ml/ir'
import { useState } from 'react'

import { Encoding } from './components/encodings/Encoding'
import { IRGraph } from './components/IRGraph'
import { ModelForm } from './components/ModelForm'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './components/ui/resizable'

export function App() {
  const [model, setModel] = useState<GraphModel | undefined>()
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={50}>
        {model ? (
          <IRGraph clearModel={() => setModel(undefined)} model={model} />
        ) : null}
        {!model ? (
          <div className="p-2">
            <ModelForm setModel={setModel} />
          </div>
        ) : null}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        {model ? <Encoding model={model} encoder={GraphEncoder} /> : null}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
