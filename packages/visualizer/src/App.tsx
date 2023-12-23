import type { GraphModel } from '@cm2ml/ir'
import type { Plugin } from '@cm2ml/plugin'
import { useState } from 'react'

import { EncoderForm } from './components/EncoderForm'
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
  const [encoder, setEncoder] = useState<
    Plugin<GraphModel, unknown, any> | undefined
  >(undefined)
  // TODO: Make clear buttons red
  // TODO: Load example button for model form
  // TODO: Clear button for encoder section
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
        {model && encoder ? <Encoding model={model} encoder={encoder} /> : null}
        {!encoder ? (
          <div className="p-2">
            <EncoderForm
              canSubmit={model !== undefined}
              setEncoder={setEncoder}
            />
          </div>
        ) : null}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
