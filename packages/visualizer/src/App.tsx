import type { GraphModel } from '@cm2ml/ir'
import type { Plugin } from '@cm2ml/plugin'
import { useState } from 'react'

import { EncoderForm } from './components/EncoderForm'
import { Encoding } from './components/encodings/Encoding'
import { Model } from './components/Model'
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
  // TODO: Clear button for encoder section
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={50} className="relative">
        <Model model={model} setModel={setModel} />
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
